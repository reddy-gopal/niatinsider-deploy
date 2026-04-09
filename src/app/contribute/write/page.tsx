"use client";

import React, { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Image,
  Video,
  List,
  ListOrdered,
  Check,
  Pencil,
  X,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import Footer from '@/components/Footer';
import { useCampuses } from '@/hooks/useCampuses';
import { useClubs } from '@/hooks/useClubs';
import { articleService, type ApiCategory } from '@/lib/articleService';
import { useAuthStore } from '@/store/authStore';
const STYLE_OPTIONS = [
  { value: 'p', label: 'Normal text' },
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
  { value: 'blockquote', label: 'Quote block' },
];

const NIAT_ARTICLE_DRAFT = 'niat_article_draft';

/** Placeholder shown inside the body editor when empty. Must be stripped when saving. */
const BODY_PLACEHOLDER_HTML =
  '<span class="article-body-editor-placeholder" contenteditable="false" data-body-placeholder>Start writing...</span>';

function getBodyHtmlForSave(el: HTMLDivElement | null): string {
  if (!el) return '';
  const clone = el.cloneNode(true) as HTMLDivElement;
  clone.querySelectorAll('[data-body-placeholder]').forEach((n) => n.remove());
  return clone.innerHTML.trim();
}

/** Get plain text length from HTML (for validation). Uses same content as getBodyHtmlForSave. */
function getBodyTextLength(html: string): number {
  if (!html.trim()) return 0;
  const div = document.createElement('div');
  div.innerHTML = html;
  return (div.textContent || div.innerText || '').trim().length;
}

type ArticleDraft = {
  title: string;
  subtitle: string;
  body: string;
  attachedImages: { id: string; url: string; description: string }[];
  categoryId: string | null;
  subcategory: string;
  subcategoryOther: string;
  campusId: string;
  showSectionSelect: boolean;
};

/** Extract all img src URLs from HTML string. Cover = first image from body (via Image icon). */
function extractImageUrlsFromHtml(html: string): string[] {
  if (!html || typeof html !== 'string') return [];
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  const urls: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) urls.push(m[1].trim());
  return urls;
}

/** Remove article-image-card blocks from HTML so we don't duplicate them when saving (body = rest of content only). */
function stripImageCardsFromHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  if (typeof document === 'undefined') return html;
  const div = document.createElement('div');
  div.innerHTML = html;
  const cards = div.querySelectorAll('.article-image-card');
  cards.forEach((el) => el.remove());
  return div.innerHTML.trim();
}

function ToolbarButton({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${active ? 'bg-[#fbf2f3] text-[#991b1b]' : 'text-[rgba(30,41,59,0.7)] hover:bg-[#fbf2f3] hover:text-[#1e293b]'
        }`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-[rgba(30,41,59,0.15)] mx-1" />;
}

function WriteArticleClientContent() {
  const [isMounted, setIsMounted] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [saved, setSaved] = useState(true);
  const [saving, setSaving] = useState(false);
  const [campusId, setCampusId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [attachedImages, setAttachedImages] = useState<{ id: string; url: string; description: string }[]>([]);
  const [username, setUsername] = useState<string>('');
  const [showSectionSelect, setShowSectionSelect] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [imageModalTab, setImageModalTab] = useState<'upload' | 'url'>('upload');
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [videoModalTab, setVideoModalTab] = useState<'upload' | 'embed'>('embed');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedArticleKey, setSubmittedArticleKey] = useState<string | null>(null);
  const [submittedCampusId, setSubmittedCampusId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ title?: boolean; campus?: boolean; body?: boolean; section?: boolean; subcategory?: boolean; subcategoryOther?: boolean }>({});
  type ToastItem = { id: number; message: string; type: 'validation' | 'error' };
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const { campuses: apiCampuses } = useCampuses();
  const selectedCategory = categories.find((c: ApiCategory) => c.id === categoryId);
  const isClubDirectory = selectedCategory?.slug === 'club-directory';
  const { clubs, loading: clubsLoading } = useClubs(
    isClubDirectory && campusId
      ? { campus: campusId }
      : undefined
  );
  const submittedCampusSlug =
    submittedCampusId != null
      ? (apiCampuses.find((c) => String(c.id) === String(submittedCampusId))?.slug ?? String(submittedCampusId))
      : null;
  const toastIdRef = useRef(0);
  const toastTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const addToast = useCallback((message: string, type: 'validation' | 'error') => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    const t = setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 5000);
    toastTimeoutsRef.current.push(t);
  }, []);
  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);
  useEffect(() => () => {
    toastTimeoutsRef.current.forEach(clearTimeout);
    toastTimeoutsRef.current = [];
  }, []);
  const [subcategory, setSubcategory] = useState('');
  const [subcategoryOther, setSubcategoryOther] = useState('');
  type SubcategoryOption = { value: string; label: string; requires_other: boolean };
  const [subcategoryOptions, setSubcategoryOptions] = useState<SubcategoryOption[]>([]);
  const [showMiniToolbar, setShowMiniToolbar] = useState(false);
  const [miniToolbarPos, setMiniToolbarPos] = useState({ top: 0, left: 0 });
  const miniToolbarRef = useRef<HTMLDivElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [loadEditError, setLoadEditError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const editParam = searchParams.get('edit');
  const prefillCampusParam = searchParams.get('campus');
  const prefillCategoryParam = searchParams.get('category');
  const prefillSubcategoryParam = searchParams.get('subcategory');
  const router = useRouter();
  const storeUsername = useAuthStore((state) => state.user?.username ?? '');
  const storeCampusId = useAuthStore((state) => state.campusId);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  /** Reset form for a new article and navigate to write (no edit param). Closes success modal. */
  const startWriteAnotherArticle = useCallback(() => {
    setShowSuccessModal(false);
    setSubmittedArticleKey(null);
    setSubmittedCampusId(null);
    setEditId(null);
    setLoadEditError(null);
    setTitle('');
    setSubtitle('');
    setCategoryId(null);
    setSubcategory('');
    setSubcategoryOther('');
    setCampusId('');
    setShowSectionSelect(true);
    setAttachedImages([]);
    setValidationErrors({});
    setSubmitError(null);
    if (bodyRef.current) {
      bodyRef.current.innerHTML = BODY_PLACEHOLDER_HTML;
    }
    if (typeof localStorage !== 'undefined') localStorage.removeItem(NIAT_ARTICLE_DRAFT);
    router.replace('/contribute/write');
  }, [router]);

  useEffect(() => {
    articleService.getCategories().then((res) => setCategories(Array.isArray(res.data) ? res.data : [])).finally(() => setCategoriesLoading(false));
  }, []);

  useEffect(() => {
    setUsername(storeUsername);
  }, [storeUsername]);

  useEffect(() => {
    const slug = categoryId != null ? categories.find((c: ApiCategory) => c.id === categoryId)?.slug : '';
    if (!slug) {
      setSubcategoryOptions([]);
      return;
    }
    articleService
      .getSubcategories(slug, campusId || undefined)
      .then((res) => {
        const list = (res.data || []).map((s: { slug: string; label: string; requires_other: boolean }) => ({
          value: s.slug,
          label: s.label,
          requires_other: s.requires_other,
        }));
        setSubcategoryOptions(list);
      })
      .catch(() => setSubcategoryOptions([]));
  }, [categoryId, categories, campusId]);

  useEffect(() => {
    const id = (editParam || '').trim();
    if (!id) return;
    setLoadEditError(null);
    articleService
      .editDetail(id)
      .then((res: { data: import('@/types/articleApi').ApiArticle }) => {
        const a = res.data;
        setEditId(a.id);
        setTitle(a.title);
        setSubtitle(a.excerpt);
        setCampusId(a.campus_id != null ? String(a.campus_id) : '');
        setCategoryId(a.category_id != null ? String(a.category_id) : null);
        setSubcategory((a as { subcategory?: string }).subcategory ?? '');
        setSubcategoryOther((a as { subcategory_other?: string }).subcategory_other ?? '');
        setShowSectionSelect(false);
        // Populate attached images so author can add/remove when editing
        const imageUrls = Array.isArray(a.images) ? a.images : [];
        setAttachedImages(
          imageUrls.map((url, i) => ({
            id: `edit-${a.id}-${i}`,
            url,
            description: '',
          }))
        );
        // Body without image-card blocks so we don't duplicate on save (cards come from attachedImages)
        if (bodyRef.current) {
          const bodyWithoutCards = a.body != null ? stripImageCardsFromHtml(a.body) : '';
          bodyRef.current.innerHTML = bodyWithoutCards || BODY_PLACEHOLDER_HTML;
        }
      })
      .catch((error: unknown) => {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 401) {
          router.replace('/login');
          return;
        }
        if (status === 404) {
          router.replace('/404');
          return;
        }
        setLoadEditError('Failed to load article for editing.');
      });
  }, [editParam]);

  // Restore draft from localStorage when not editing an existing article
  useEffect(() => {
    if (editParam != null && editParam !== '') return;
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(NIAT_ARTICLE_DRAFT) : null;
    if (!raw) return;
    try {
      const d: ArticleDraft = JSON.parse(raw);
      setTitle(d.title ?? '');
      setSubtitle(d.subtitle ?? '');
      setCategoryId(d.categoryId != null ? String(d.categoryId) : null);
      setSubcategory(d.subcategory ?? '');
      setSubcategoryOther(d.subcategoryOther ?? '');
      setAttachedImages(Array.isArray(d.attachedImages) ? d.attachedImages : []);
      setCampusId(d.campusId ?? '');
      setShowSectionSelect(d.showSectionSelect ?? true);
      const bodyHtml = d.body ?? '';
      if (bodyHtml && bodyRef.current) {
        bodyRef.current.innerHTML = bodyHtml;
      }
    } catch (_) {
      /* ignore invalid draft */
    }
  }, [editParam]);

  // Auto-select campus from auth store when writing a new article (only if no draft restored)
  useEffect(() => {
    if (editParam != null && editParam !== '') return;
    if (storeCampusId != null) {
      setCampusId((prev) => (prev === '' ? String(storeCampusId) : prev));
    }
  }, [editParam, storeCampusId]);

  // Allow pre-filling section/subcategory/campus from deep links (e.g. club detail CTA).
  useEffect(() => {
    if (editParam != null && editParam !== '') return;
    if (!prefillCampusParam && !prefillCategoryParam && !prefillSubcategoryParam) return;

    if (prefillCampusParam) {
      setCampusId(prefillCampusParam);
    }

    if (prefillCategoryParam) {
      const matchedCategory = categories.find((c: ApiCategory) => c.slug === prefillCategoryParam);
      if (matchedCategory?.id != null) {
        setCategoryId(String(matchedCategory.id));
        setShowSectionSelect(false);
      }
    }

    if (prefillSubcategoryParam) {
      setSubcategory(prefillSubcategoryParam);
    }
  }, [
    editParam,
    categories,
    prefillCampusParam,
    prefillCategoryParam,
    prefillSubcategoryParam,
  ]);

  const execCommand = useCallback((cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    bodyRef.current?.focus();
  }, []);


  const saveDraftToStorage = useCallback(() => {
    if (typeof localStorage === 'undefined') return;
    const bodyHtml = getBodyHtmlForSave(bodyRef.current);
    const draft: ArticleDraft = {
      title,
      subtitle,
      body: bodyHtml,
      attachedImages,
      categoryId,
      subcategory,
      subcategoryOther,
      campusId,
      showSectionSelect,
    };
    localStorage.setItem(NIAT_ARTICLE_DRAFT, JSON.stringify(draft));
  }, [title, subtitle, attachedImages, categoryId, subcategory, subcategoryOther, campusId, showSectionSelect]);

  const skipFirstSaveRef = useRef(true);
  useEffect(() => {
    // Skip first run so we don't overwrite restored draft with empty state on reload
    if (skipFirstSaveRef.current) {
      skipFirstSaveRef.current = false;
      return;
    }
    saveDraftToStorage();
  }, [saveDraftToStorage]);

  const bodySaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleBodyInput = useCallback(() => {
    const el = bodyRef.current;
    if (el && !el.innerText?.trim()) el.innerHTML = BODY_PLACEHOLDER_HTML;
    const bodyContent = getBodyHtmlForSave(el);
    if (getBodyTextLength(bodyContent) >= 100) {
      setValidationErrors((prev) => (prev.body ? { ...prev, body: false } : prev));
    }
    setSaved(false);
    setSaving(true);
    if (bodySaveTimeoutRef.current) clearTimeout(bodySaveTimeoutRef.current);
    bodySaveTimeoutRef.current = setTimeout(() => {
      setSaving(false);
      setSaved(true);
      if (typeof localStorage === 'undefined') return;
      const bodyHtml = getBodyHtmlForSave(bodyRef.current);
      const raw = localStorage.getItem(NIAT_ARTICLE_DRAFT);
      let draft: ArticleDraft = {
        title: '',
        subtitle: '',
        body: '',
        attachedImages: [],
        categoryId: null,
        subcategory: '',
        subcategoryOther: '',
        campusId: '',
        showSectionSelect: true,
      };
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Partial<ArticleDraft>;
          draft = { ...draft, ...parsed };
        } catch (_) { /* ignore */ }
      }
      draft.body = bodyHtml;
      if (!Array.isArray(draft.attachedImages)) draft.attachedImages = [];
      localStorage.setItem(NIAT_ARTICLE_DRAFT, JSON.stringify(draft));
      bodySaveTimeoutRef.current = null;
    }, 600);
    return () => {
      if (bodySaveTimeoutRef.current) clearTimeout(bodySaveTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const handler = () => handleBodyInput();
    el.addEventListener('input', handler);
    return () => el.removeEventListener('input', handler);
  }, [handleBodyInput]);

  // When body is empty (no draft/edit content), show placeholder inside the editor
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const hasPlaceholder = el.querySelector('[data-body-placeholder]');
    const hasContent = el.innerText?.trim() && el.innerText?.trim() !== 'Start writing...';
    if (!hasContent && !hasPlaceholder) el.innerHTML = BODY_PLACEHOLDER_HTML;
  }, [title, subtitle, editId]);

  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !bodyRef.current?.contains(sel.anchorNode)) {
        setShowMiniToolbar(false);
        return;
      }
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setMiniToolbarPos({
        top: rect.top + window.scrollY - 50,
        left: rect.left + (rect.width / 2) - 120,
      });
      setShowMiniToolbar(true);
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const selectedCategoryName = selectedCategory?.name ?? '';
  const needsSubcategory = isClubDirectory ? true : subcategoryOptions.length > 0;
  const subcategoryLabel = isClubDirectory ? 'Club' : 'Subcategory';
  const selectedSubcategoryOption = isClubDirectory ? undefined : subcategoryOptions.find((o) => o.value === subcategory);
  const showSubcategoryOther = isClubDirectory ? false : (selectedSubcategoryOption?.requires_other ?? false);
  const othersPlaceholder = 'e.g. specify name';

  const handleSubmit = async () => {
    const errors: typeof validationErrors = {};
    if (!title.trim()) errors.title = true;
    if (categoryId == null) errors.section = true;
    if (needsSubcategory) {
      if (isClubDirectory && !campusId.trim()) {
        errors.subcategory = true;
      } else {
        if (!subcategory.trim()) errors.subcategory = true;
        const sel = subcategoryOptions.find((o) => o.value === subcategory);
        if (sel?.requires_other && !subcategoryOther.trim()) errors.subcategoryOther = true;
      }
    }
    const bodyContent = getBodyHtmlForSave(bodyRef.current);
    const bodyTextLength = getBodyTextLength(bodyContent);
    if (bodyTextLength < 100) errors.body = true;
    setValidationErrors(errors);
    setSubmitError(null);
    if (Object.keys(errors).length > 0) {
      if (errors.title) addToast('Please add a title.', 'validation');
      if (errors.section) addToast('Please select a section.', 'validation');
      if (errors.body) addToast('Body should be at least 100 characters.', 'validation');
      if (errors.subcategory) {
        if (isClubDirectory && !campusId.trim()) addToast('Complete your campus profile to select a club.', 'validation');
        else addToast(`Please select a ${subcategoryLabel.toLowerCase()}.`, 'validation');
      }
      if (errors.subcategoryOther) addToast(`Please specify the ${subcategoryLabel.toLowerCase()} name.`, 'validation');
      if (errors.campus) addToast('Please select a campus.', 'validation');
      return;
    }
    setSubmitLoading(true);
    const campusName = apiCampuses.find((c) => String(c.id) === campusId)?.name ?? '';
    const safeCampusId = campusId.trim() !== '' ? campusId : null;
    const safeCategoryId = categoryId != null && categoryId !== '' ? categoryId : null;
    try {
      const subcategoryPayload = needsSubcategory
        ? {
          subcategory: subcategory.trim(),
          subcategory_other: selectedSubcategoryOption?.requires_other ? subcategoryOther.trim() : '',
        }
        : {};
      const bodyHtml = buildImageCardsHtml(attachedImages) + (bodyContent || '');
      const images = [...attachedImages.map((i) => i.url), ...extractImageUrlsFromHtml(bodyContent || '')];
      const coverImage = images[0] || '';
      const payload = {
        campus_id: safeCampusId,
        campus_name: campusName,
        ...(safeCategoryId !== null && { category_id: safeCategoryId }),
        title: title.trim(),
        excerpt: subtitle.trim() || title.trim().slice(0, 200),
        body: bodyHtml || bodyContent,
        cover_image: coverImage || '',
        images,
        is_global_guide: false,
        save_as_draft: false,
        ...subcategoryPayload,
      };

      // Debug logging
      console.log('[DEBUG] Frontend payload:', payload);
      console.log('[DEBUG] categoryId:', categoryId, 'safeCategoryId:', safeCategoryId);
      console.log('[DEBUG] campusId:', campusId, 'safeCampusId:', safeCampusId);
      if (editId) {
        await articleService.update(editId, { ...payload, status: 'pending_review' });
        setSubmittedArticleKey(editId);
        setSubmittedCampusId(safeCampusId);
      } else {
        const res = await articleService.create(payload);
        const created = res.data as { id: string; slug?: string; campus_id?: string | null };
        setSubmittedArticleKey(created.slug || created.id);
        setSubmittedCampusId(created.campus_id ?? safeCampusId);
      }
      if (typeof localStorage !== 'undefined') localStorage.removeItem(NIAT_ARTICLE_DRAFT);
      setShowSuccessModal(true);
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: Record<string, unknown> }; message?: string };
      const data = err?.response?.data;
      const statusCode = err?.response?.status;
      const messages: string[] = [];

      if (statusCode === 401) messages.push('Please log in again to submit.');
      else if (statusCode === 403) messages.push("You don't have permission to submit this article.");
      else if (data && typeof data === 'object') {
        const detail = data.detail;
        if (typeof detail === 'string') messages.push(detail);
        else if (Array.isArray(detail)) detail.forEach((d) => typeof d === 'string' && messages.push(d));
        Object.entries(data).forEach(([key, value]) => {
          if (key === 'detail') return;
          const msg = Array.isArray(value) ? value.find((v): v is string => typeof v === 'string') : typeof value === 'string' ? value : null;
          if (msg) messages.push(msg);
        });
        const fieldMap: Record<string, keyof typeof validationErrors> = {
          title: 'title', body: 'body', category_id: 'section', campus_id: 'section',
          subcategory: 'subcategory', subcategory_other: 'subcategoryOther',
        };
        const fields: Partial<typeof validationErrors> = {};
        Object.keys(data).forEach((k) => { if (fieldMap[k]) fields[fieldMap[k]] = true; });
        if (Object.keys(fields).length) setValidationErrors((prev) => ({ ...prev, ...fields }));
      }
      if (messages.length === 0 && err?.message) messages.push(err.message);
      if (messages.length === 0) messages.push('Submission failed. Please try again.');
      setSubmitError(messages.join(' '));
      addToast(messages.join(' '), 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  /** Add uploaded/URL image to the list below the author (small cards with description input). */
  const addToAttachedImages = useCallback((url: string) => {
    if (!url.trim()) return;
    setAttachedImages((prev) => [...prev, { id: crypto.randomUUID(), url: url.trim(), description: '' }]);
  }, []);

  const insertImage = () => {
    const url = imageUrl.trim();
    if (!url) return;
    addToAttachedImages(url);
    setImageUrl('');
    setShowImageModal(false);
  };

  const uploadImageFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImageUploadError(null);
    setImageUploading(true);
    try {
      const { data } = await articleService.uploadImage(file);
      if (data?.url) {
        addToAttachedImages(data.url);
        setShowImageModal(false);
      }
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : null;
      setImageUploadError(msg || 'Upload failed. Try again.');
    } finally {
      setImageUploading(false);
    }
  }, []);

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadImageFile(file);
    e.target.value = '';
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    uploadImageFile(file);
  };

  const removeAttachedImage = (id: string) => {
    setAttachedImages((prev) => prev.filter((x) => x.id !== id));
  };

  /** Build HTML for image cards (for body payload). Borderless, full-width; remove button + img + caption. */
  const buildImageCardsHtml = useCallback((list: { id: string; url: string; description: string }[]) => {
    const escape = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    return list
      .map(
        (item) =>
          `<div class="article-image-card">
  <button type="button" class="article-image-card__remove" data-remove-image-card aria-label="Remove image">âœ•</button>
  <img src="${item.url.replace(/"/g, '&quot;')}" alt="" class="article-image-card__img" />
  <div class="article-image-card__caption" contenteditable="true" data-placeholder="Add a description...">${escape(item.description)}</div>
</div>`
      )
      .join('');
  }, []);

  // Some browser extensions inject attributes (e.g. fdprocessedid) before hydration,
  // causing unavoidable server/client mismatches on dense form UIs.
  // Keep this guard after all hooks so hook order remains stable.
  if (!isMounted) return null;

  return (
    <div className="write-article-page min-h-screen bg-white overflow-x-hidden font-sans">
      {/* No Navbar on Write Article - platform name is in the editor header */}

      {(submitError || loadEditError) && (
        <div className="mx-4 mt-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm" role="alert">
          <p className="font-medium mb-1">Submission issue</p>
          <p>{loadEditError ?? submitError}</p>
          {(submitError?.toLowerCase().includes('log in') ?? false) && (
            <Link
              href="/login"
              className="inline-flex items-center justify-center mt-3 px-4 py-2 rounded-lg bg-[#991b1b] text-white text-sm font-medium hover:bg-[#b91c1c] transition-colors"
            >
              Log in
            </Link>
          )}
        </div>
      )}

      {/* Zone 1 - Editor Header (no Navbar; platform name on left) */}
      <header
        className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-2 h-auto min-h-14 py-2 px-4 sm:px-6 border-b"
        style={{ backgroundColor: '#fff8eb', borderColor: 'rgba(30, 41, 59, 0.1)' }}
      >
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[#1e293b] hover:opacity-90 transition-opacity shrink-0"
        >
          <img
            src="/niat.svg"
            alt="NIAT"
            className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
          />
          <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#991b1b]">NIAT</span>
          <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-black">Insider</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-xs sm:text-sm shrink-0">
            {saving ? (
              <span className="text-[rgba(30,41,59,0.5)]">Saving...</span>
            ) : saved ? (
              <span className="inline-flex items-center gap-1 text-green-600">
                <Check className="h-3.5 w-3.5" /> Saved
              </span>
            ) : (
              <span className="text-amber-600">Unsaved</span>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitLoading}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-md bg-[#991b1b] text-white hover:bg-[#b91c1c] transition-colors text-xs sm:text-sm font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="animate-spin rounded-full border-2 border-white/40 border-t-white size-4 shrink-0" role="status" aria-label="Submitting" />
                  Submitting...
                </span>
              ) : (
                'Submit for Review'
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Zone 2 - Formatting Toolbar (scrolls horizontally on small screens) */}
      <div
        className="sticky z-30 flex items-center gap-1 px-4 sm:px-6 h-11 border-b overflow-x-auto overflow-y-hidden scrollbar-hide [&>*]:shrink-0"
        style={{ backgroundColor: '#ffffff', borderColor: 'rgba(30, 41, 59, 0.1)', top: '3.5rem' }}
      >
        <ToolbarButton onClick={() => execCommand('undo')} title="Undo">
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('redo')} title="Redo">
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarDivider />

        <select
          className="h-8 px-2 rounded-md border text-sm bg-white"
          style={{ borderColor: 'rgba(30, 41, 59, 0.15)' }}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => execCommand('formatBlock', e.target.value)}
        >
          {STYLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <ToolbarDivider />

        <ToolbarButton onClick={() => execCommand('bold')} title="Bold">
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('italic')} title="Italic">
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('strikeThrough')} title="Strikethrough">
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            const sel = window.getSelection();
            const text = sel?.toString() || '';
            if (text) {
              document.execCommand('insertHTML', false, `<code>${text}</code>`);
            } else {
              document.execCommand('insertHTML', false, '<code></code>');
            }
            bodyRef.current?.focus();
          }}
          title="Inline code"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarDivider />

        <ToolbarButton onClick={() => setShowImageModal(true)} title="Image">
          <Image className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => setShowVideoModal(true)} title="Video">
          <Video className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarDivider />

        <ToolbarButton onClick={() => execCommand('insertUnorderedList')} title="Bullet list">
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('insertOrderedList')} title="Numbered list">
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Floating Mini Toolbar */}
      {showMiniToolbar && (
        <div
          ref={miniToolbarRef}
          className="fixed z-[100] flex items-center gap-1 rounded-lg px-2 py-1.5"
          style={{
            top: miniToolbarPos.top,
            left: Math.max(16, miniToolbarPos.left),
            backgroundColor: '#1e293b',
            boxShadow: '0 4px 12px rgba(30, 41, 59, 0.25)',
          }}
        >
          <button
            type="button"
            onClick={() => execCommand('bold')}
            className="w-7 h-7 flex items-center justify-center rounded text-white hover:bg-white/10"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => execCommand('italic')}
            className="w-7 h-7 flex items-center justify-center rounded text-white hover:bg-white/10"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => execCommand('strikeThrough')}
            className="w-7 h-7 flex items-center justify-center rounded text-white hover:bg-white/10"
          >
            <Strikethrough className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => execCommand('formatBlock', 'h1')}
            className="w-7 h-7 flex items-center justify-center rounded text-white text-xs font-bold hover:bg-white/10"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => execCommand('formatBlock', 'h2')}
            className="w-7 h-7 flex items-center justify-center rounded text-white text-xs font-bold hover:bg-white/10"
          >
            H2
          </button>
        </div>
      )}

      {/* Zone 3 - Writing Canvas */}
      <main className="max-w-[720px] mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full min-w-0" style={{ minHeight: 'calc(100vh - 96px)' }}>
        {/* Section + subcategory - show selected section as text with Change; or dropdown to select */}
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1" style={{ maxWidth: 220 }}>
            <span className="flex items-center gap-2 text-[13px] font-medium text-[#1e293b] mb-1.5">
              Section
              {categoriesLoading && (
                <span className="animate-spin rounded-full border-2 border-[#fbf2f3] border-t-[#991b1b] size-4 shrink-0" role="status" aria-label="Loading" />
              )}
            </span>
            {categoryId != null && selectedCategoryName && !showSectionSelect ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-[14px] py-2 rounded-lg text-[13px] bg-[#fbf2f3] border border-[rgba(30,41,59,0.15)] text-[#1e293b]">
                  {selectedCategoryName}
                </span>
                <button
                  type="button"
                  onClick={() => setShowSectionSelect(true)}
                  className="p-2 rounded-lg text-[#991b1b] hover:bg-[#991b1b]/10 transition-colors"
                  title="Change section"
                  aria-label="Change section"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <select
                id="section-select"
                value={categoryId ?? ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const nextId = e.target.value ? e.target.value : null;
                  setCategoryId(nextId);
                  setShowSectionSelect(false);
                  if (validationErrors.section) setValidationErrors((prev) => ({ ...prev, section: false }));
                  setSubcategory('');
                  setSubcategoryOther('');
                }}
                className={`w-full px-[14px] py-2 rounded-lg text-[13px] bg-[#fbf2f3] border transition-colors ${validationErrors.section ? 'border-[#991b1b]' : 'border-[rgba(30,41,59,0.15)] hover:border-[#991b1b]'
                  }`}
                style={{ color: '#1e293b' }}
              >
                <option value="">Select a Section</option>
                {categoriesLoading ? (
                  <option disabled>Loading...</option>
                ) : (
                  categories.map((c: ApiCategory) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            )}
            {validationErrors.section && (
              <p className="mt-1 text-xs text-[#991b1b]">Please select a section.</p>
            )}
          </div>

          {needsSubcategory && (
            <>
              <div className="min-w-0 flex-1" style={{ maxWidth: 200 }}>
                <label htmlFor="subcategory-select" className="block text-[13px] font-medium text-[#1e293b] mb-1.5">
                  {subcategoryLabel}
                </label>
                <select
                  id="subcategory-select"
                  value={subcategory}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setSubcategory(e.target.value);
                    if (validationErrors.subcategory) setValidationErrors((prev) => ({ ...prev, subcategory: false }));
                    if (!isClubDirectory && !subcategoryOptions.find((o) => o.value === e.target.value)?.requires_other) setSubcategoryOther('');
                  }}
                  disabled={isClubDirectory && (!campusId.trim() || clubsLoading || clubs.length === 0)}
                  className={`w-full px-[14px] py-2 rounded-lg text-[13px] bg-[#fbf2f3] border transition-colors ${validationErrors.subcategory ? 'border-[#991b1b]' : 'border-[rgba(30,41,59,0.15)] hover:border-[#991b1b]'
                    }`}
                  style={{ color: '#1e293b' }}
                >
                  {isClubDirectory ? (
                    <>
                      {!campusId.trim() ? (
                        <option value="">Complete your campus profile to select a club</option>
                      ) : clubsLoading ? (
                        <option value="">Loading clubs...</option>
                      ) : clubs.length === 0 ? (
                        <option value="">No clubs found for your campus</option>
                      ) : (
                        <option value="">Select club</option>
                      )}
                      {clubs.map((club) => (
                        <option key={club.id} value={club.slug}>
                          {club.name}
                        </option>
                      ))}
                    </>
                  ) : (
                    <>
                      <option value="">Select {subcategoryLabel.toLowerCase()}</option>
                      {subcategoryOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                {isClubDirectory && !campusId.trim() && (
                  <p className="mt-1 text-xs text-[#991b1b]">Complete your campus profile to select a club</p>
                )}
                {isClubDirectory && campusId.trim() && !clubsLoading && clubs.length === 0 && (
                  <p className="mt-1 text-xs text-[#64748b]">No clubs found for your campus</p>
                )}
                {validationErrors.subcategory && (
                  <p className="mt-1 text-xs text-[#991b1b]">Please select a {subcategoryLabel.toLowerCase()}.</p>
                )}
              </div>
              {showSubcategoryOther && (
                <div className="min-w-0 flex-1" style={{ maxWidth: 200 }}>
                  <label htmlFor="subcategory-other" className="block text-[13px] font-medium text-[#1e293b] mb-1.5">
                    Specify
                  </label>
                  <input
                    id="subcategory-other"
                    type="text"
                    value={subcategoryOther}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setSubcategoryOther(e.target.value);
                      if (validationErrors.subcategoryOther) setValidationErrors((prev) => ({ ...prev, subcategoryOther: false }));
                    }}
                    placeholder={othersPlaceholder}
                    className={`w-full px-[14px] py-2 rounded-lg text-[13px] bg-white border transition-colors ${validationErrors.subcategoryOther ? 'border-[#991b1b]' : 'border-[rgba(30,41,59,0.15)]'
                      }`}
                    style={{ color: '#1e293b' }}
                  />
                  {validationErrors.subcategoryOther && (
                    <p className="mt-1 text-xs text-[#991b1b]">Please specify.</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Title */}
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setTitle(e.target.value);
            if (validationErrors.title) setValidationErrors((prev) => ({ ...prev, title: false }));
          }}
          className={`article-title-input w-full border-none outline-none bg-transparent mb-2 placeholder-[rgba(30,41,59,0.3)] ${validationErrors.title ? 'border-b-2 border-[#991b1b] shake' : ''
            }`}
          title={validationErrors.title ? 'Add a title' : undefined}
          aria-invalid={validationErrors.title}
          aria-describedby={validationErrors.title ? 'title-error' : undefined}
        />
        {validationErrors.title && <p id="title-error" className="sr-only" role="alert">Please add a title.</p>}

        {/* Subtitle */}
        <input
          type="text"
          placeholder="Add a subtitle..."
          value={subtitle}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubtitle(e.target.value)}
          className="article-subtitle-input w-full border-none outline-none bg-transparent mb-4 placeholder-[rgba(30,41,59,0.5)]"
        />

        {/* Author - simple username */}
        <div
          className="inline-flex items-center px-3 py-1.5 rounded-md border mb-4 text-sm font-medium text-[#1e293b]"
          style={{ borderColor: 'rgba(30, 41, 59, 0.15)', backgroundColor: 'rgba(30, 41, 59, 0.04)' }}
        >
          {username || '...'}
        </div>

        {/* Uploaded images - small cards below author, preview only; cancel icon to remove */}
        {attachedImages.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-4">
              {attachedImages.map((item) => (
                <div
                  key={item.id}
                  className="article-image-card flex flex-col rounded-xl border overflow-hidden bg-[#fafafa] flex-shrink-0"
                  style={{ width: '180px', borderColor: 'rgba(30, 41, 59, 0.12)', boxShadow: '0 2px 8px rgba(30, 41, 59, 0.06)' }}
                >
                  <div className="relative">
                    <div className="article-image-card__image-wrap flex items-center justify-center p-2 bg-[#f8fafc] min-h-[100px]">
                      <img src={item.url} alt="" className="max-w-full h-auto object-contain max-h-32" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachedImage(item.id)}
                      className="absolute top-1 right-1 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                      title="Remove image"
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="h-px my-4" style={{ backgroundColor: 'rgba(30, 41, 59, 0.08)' }} />

        {/* Body Editor - placeholder "Start writing..." is inside the editor (in the text flow) */}
        <div className={validationErrors.body ? 'rounded ring-2 ring-[#991b1b]' : ''}>
          <div
            ref={bodyRef}
            contentEditable
            suppressContentEditableWarning
            className="article-body-editor w-full bg-transparent ni-article"
            aria-invalid={validationErrors.body}
            aria-describedby={validationErrors.body ? 'body-error' : undefined}
            onFocus={() => {
              const el = bodyRef.current;
              if (!el) return;
              const ph = el.querySelector('[data-body-placeholder]');
              if (ph && el.innerText?.trim() === 'Start writing...') {
                ph.remove();
                const sel = window.getSelection();
                const range = document.createRange();
                range.setStart(el, 0);
                range.collapse(true);
                sel?.removeAllRanges();
                sel?.addRange(range);
              }
            }}
          />
          {validationErrors.body && <p id="body-error" className="sr-only" role="alert">Body must be at least 100 characters.</p>}
        </div>
      </main>

      {/* Image Modal */}
      {showImageModal && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setShowImageModal(false)} />
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[480px] p-8 rounded-xl bg-white"
            style={{ boxShadow: '0 8px 32px rgba(30, 41, 59, 0.15)' }}
          >
            <h3 className="font-playfair text-[20px] font-bold mb-6" style={{ color: '#1e293b' }}>
              Insert Image
            </h3>
            <div className="flex gap-4 border-b mb-6" style={{ borderColor: 'rgba(30, 41, 59, 0.1)' }}>
              <button
                type="button"
                onClick={() => { setImageModalTab('upload'); setImageUploadError(null); }}
                className={`pb-2 text-sm font-medium ${imageModalTab === 'upload' ? 'text-[#991b1b] border-b-2 border-[#991b1b]' : 'text-[rgba(30,41,59,0.7)]'
                  }`}
              >
                Upload
              </button>
              <button
                type="button"
                onClick={() => { setImageModalTab('url'); setImageUploadError(null); }}
                className={`pb-2 text-sm font-medium ${imageModalTab === 'url' ? 'text-[#991b1b] border-b-2 border-[#991b1b]' : 'text-[rgba(30,41,59,0.7)]'
                  }`}
              >
                URL
              </button>
            </div>
            {imageModalTab === 'upload' ? (
              <>
                <input
                  ref={imageFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageFileSelect}
                  aria-label="Choose image file"
                  disabled={imageUploading}
                />
                {imageUploadError && (
                  <p className="text-sm text-red-600 mb-3">{imageUploadError}</p>
                )}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => !imageUploading && imageFileInputRef.current?.click()}
                  onKeyDown={(e) => { if (!imageUploading && (e.key === 'Enter' || e.key === ' ')) imageFileInputRef.current?.click(); }}
                  onDrop={handleImageDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:border-[#991b1b] transition-colors mb-6 disabled:opacity-60"
                  style={{ borderColor: 'rgba(30, 41, 59, 0.2)' }}
                  aria-busy={imageUploading}
                >
                  {imageUploading ? (
                    <span className="flex items-center justify-center gap-2 text-sm" style={{ color: 'rgba(30, 41, 59, 0.7)' }}>
                      <span className="animate-spin rounded-full border-2 border-[#fbf2f3] border-t-[#991b1b] size-5 shrink-0" role="status" aria-label="Uploading" />
                      Uploading...
                    </span>
                  ) : (
                    <>
                      <Image className="h-12 w-12 mx-auto mb-2 text-[rgba(30,41,59,0.4)]" />
                      <p className="text-sm" style={{ color: 'rgba(30, 41, 59, 0.7)' }}>
                        Click to open file explorer or drop image here
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'rgba(30, 41, 59, 0.5)' }}>
                        Image is uploaded to the server (article/images/)
                      </p>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-3 mb-6">
                <input
                  type="url"
                  placeholder="Paste image URL..."
                  value={imageUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md text-sm"
                  style={{ borderColor: 'rgba(30, 41, 59, 0.1)' }}
                />
                <button
                  type="button"
                  onClick={insertImage}
                  className="px-4 py-2 rounded-md bg-[#991b1b] text-white text-sm font-medium hover:bg-[#b91c1c]"
                >
                  Insert
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowImageModal(false)}
              className="px-4 py-2 rounded-md border text-sm"
              style={{ borderColor: 'rgba(30, 41, 59, 0.2)', color: 'rgba(30, 41, 59, 0.7)' }}
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setShowVideoModal(false)} />
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[480px] p-8 rounded-xl bg-white"
            style={{ boxShadow: '0 8px 32px rgba(30, 41, 59, 0.15)' }}
          >
            <h3 className="font-playfair text-[20px] font-bold mb-6" style={{ color: '#1e293b' }}>
              Insert Video
            </h3>
            <div className="flex gap-4 border-b mb-6" style={{ borderColor: 'rgba(30, 41, 59, 0.1)' }}>
              <button
                type="button"
                onClick={() => setVideoModalTab('embed')}
                className={`pb-2 text-sm font-medium ${videoModalTab === 'embed' ? 'text-[#991b1b] border-b-2 border-[#991b1b]' : 'text-[rgba(30,41,59,0.7)]'
                  }`}
              >
                Embed URL
              </button>
              <button
                type="button"
                onClick={() => setVideoModalTab('upload')}
                className={`pb-2 text-sm font-medium ${videoModalTab === 'upload' ? 'text-[#991b1b] border-b-2 border-[#991b1b]' : 'text-[rgba(30,41,59,0.7)]'
                  }`}
              >
                Upload
              </button>
            </div>
            {videoModalTab === 'embed' ? (
              <div className="space-y-3 mb-6">
                <input
                  type="url"
                  placeholder="Paste YouTube, Loom, or video URL..."
                  value={videoUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVideoUrl(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md text-sm"
                  style={{ borderColor: 'rgba(30, 41, 59, 0.1)' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (videoUrl) {
                      execCommand('insertHTML', `<p>Video: ${videoUrl}</p>`);
                      setVideoUrl('');
                      setShowVideoModal(false);
                    }
                  }}
                  className="px-4 py-2 rounded-md bg-[#991b1b] text-white text-sm font-medium hover:bg-[#b91c1c]"
                >
                  Insert
                </button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:border-[#991b1b] transition-colors mb-6"
                style={{ borderColor: 'rgba(30, 41, 59, 0.2)' }}
              >
                <Video className="h-12 w-12 mx-auto mb-2 text-[rgba(30,41,59,0.4)]" />
                <p className="text-sm" style={{ color: 'rgba(30, 41, 59, 0.7)' }}>
                  Drop video here or click to upload
                </p>
                <p className="text-xs mt-1" style={{ color: 'rgba(30, 41, 59, 0.5)' }}>
                  MP4, MOV - max 100MB
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowVideoModal(false)}
              className="px-4 py-2 rounded-md border text-sm"
              style={{ borderColor: 'rgba(30, 41, 59, 0.2)', color: 'rgba(30, 41, 59, 0.7)' }}
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {/* Success Modal - engaging post-submit */}
      {showSuccessModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" />
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4 p-6 sm:p-8 rounded-2xl bg-white text-center"
            style={{ boxShadow: '0 20px 60px rgba(30, 41, 59, 0.2)' }}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-5 shadow-lg">
              <Check className="h-10 w-10 text-white stroke-[2.5]" />
            </div>
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <Sparkles className="h-5 w-5 text-[#991b1b]" />
              <h3 className="font-playfair text-2xl font-bold" style={{ color: '#1e293b' }}>
                You're live in the queue!
              </h3>
            </div>
            <p className="text-sm sm:text-base mb-6" style={{ color: 'rgba(30, 41, 59, 0.75)' }}>
              Your article has been saved and is now in the review queue. A moderator will look at it soon - once approved, it'll be visible to the whole community.
            </p>
            <div className="flex flex-col gap-3">
              {submittedArticleKey != null && (
                <Link
                  href={submittedCampusSlug != null ? `/${submittedCampusSlug}/article/${submittedArticleKey}?preview=1` : `/article/${submittedArticleKey}?preview=1`}
                  className="inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#991b1b] text-white font-medium hover:bg-[#b91c1c] transition-colors"
                  onClick={() => setShowSuccessModal(false)}
                >
                  <ExternalLink className="h-4 w-4" />
                  View my article
                </Link>
              )}
              <button
                type="button"
                onClick={startWriteAnotherArticle}
                className="inline-flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium hover:bg-[#fbf2f3] transition-colors"
                style={{ borderColor: '#991b1b', color: '#991b1b' }}
              >
                <Pencil className="h-4 w-4" />
                Write another article
              </button>
            </div>
          </div>
        </>
      )}

      {/* Placeholder and validation styles */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .shake { animation: shake 0.3s ease-in-out; }
        /* Placeholder for contenteditable (e.g. image captions). Exclude body editor - it uses the overlay. */
        [contenteditable]:not(.article-body-editor):empty::before {
          content: attr(data-placeholder);
          color: rgba(30, 41, 59, 0.4);
        }
        [contenteditable] h1 {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          font-weight: 700;
          color: #1e293b;
        }
        [contenteditable] h2 {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 600;
          color: #1e293b;
        }
        [contenteditable] h3 {
          font-family: 'Playfair Display', serif;
          font-size: 21px;
          font-weight: 600;
          color: #1e293b;
        }
        [contenteditable] blockquote {
          border-left: 4px solid #991b1b;
          padding-left: 20px;
          color: rgba(30, 41, 59, 0.7);
          font-style: italic;
          font-size: 19px;
        }
        [contenteditable] code {
          background: #fbf2f3;
          color: #991b1b;
          font-family: monospace;
          padding: 2px 6px;
          border-radius: 4px;
        }
        /* Write article page - system sans-serif stack */
        .write-article-page,
        .write-article-page * {
          font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .article-title-input {
          font-family: inherit;
          font-size: 2.5rem;
          font-weight: 700;
          color: #111827;
        }
        .article-subtitle-input {
          font-family: inherit;
          font-size: 1.1rem;
          color: #6b7280;
        }
        .article-body-editor {
          outline: none;
          min-height: 300px;
          font-family: inherit;
          font-size: 1.05rem;
          line-height: 1.75;
          color: #1f2937;
        }
        .article-body-editor-placeholder {
          font-family: inherit;
          font-size: 1.05rem;
          line-height: 1.75;
          color: #9ca3af;
        }
        /* Image card - borderless, full-width; remove button + img + caption */
        .article-image-card {
          position: relative;
          margin: 24px 0;
          display: block;
          border: none;
          background: transparent;
          padding: 0;
        }
        .article-image-card__img {
          display: block;
          max-width: 100%;
          width: 100%;
          height: auto;
          object-fit: contain;
          border-radius: 4px;
        }
        .article-image-card__remove {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.55);
          color: white;
          border: none;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          cursor: pointer;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          opacity: 0;
          transition: opacity 0.15s ease;
        }
        .article-image-card:hover .article-image-card__remove {
          opacity: 1;
        }
        .article-image-card__caption {
          margin-top: 8px;
          font-size: 13px;
          color: #9ca3af;
          text-align: center;
          outline: none;
          min-height: 20px;
        }
        .article-image-card__caption:empty::before {
          content: attr(data-placeholder);
          color: #d1d5db;
          pointer-events: none;
        }
        .article-body-read-only .article-image-card__remove {
          display: none;
        }
        /* Editor-only: thumbnails below author use __image-wrap */
        .write-article-page .article-image-card__image-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100px;
          padding: 8px;
          background: #f8fafc;
        }
        .write-article-page .article-image-card__image-wrap img {
          max-width: 100%;
          height: auto;
          object-fit: contain;
          max-height: 128px;
        }
      `}</style>

      {/* Toasts - bottom-right */}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-[min(100vw-2rem,22rem)]"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={`flex items-start gap-3 rounded-xl border shadow-lg px-4 py-3 text-sm transition-all duration-200 ${t.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
          >
            <p className="flex-1 min-w-0 pt-0.5">{t.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className="shrink-0 p-1 rounded-md opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-amber-400"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}

export default function WriteArticlePage() {
  return (
    <Suspense fallback={null}>
      <WriteArticleClientContent />
    </Suspense>
  );
}
