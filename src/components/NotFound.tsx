import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

interface NotFoundProps {
  message?: string;
}

export default function NotFound({ message = 'The page you’re looking for doesn’t exist or has been moved.' }: NotFoundProps) {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
        <h1 className="font-display text-2xl md:text-4xl font-bold text-black mb-3">Page not found</h1>
        <p className="text-black/70 mb-8">{message}</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#991b1b] text-white font-medium hover:bg-[#b91c1c] transition-colors"
        >
          Back to Home
        </Link>
      </div>
      <Footer />
    </div>
  );
}
