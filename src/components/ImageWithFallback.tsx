import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackIcon?: React.ReactNode;
}

export default function ImageWithFallback({ fallbackIcon, className, ...props }: ImageWithFallbackProps) {
    const [error, setError] = useState(false);

    if (error || !props.src) {
        return (
            <div className={`bg-gray-200 flex items-center justify-center ${className || ''}`}>
                {fallbackIcon || <ImageIcon className="h-8 w-8 text-gray-400" />}
            </div>
        );
    }

    return (
        <img
            {...props}
            className={className}
            onError={(e) => {
                setError(true);
                if (props.onError) props.onError(e);
            }}
        />
    );
}
