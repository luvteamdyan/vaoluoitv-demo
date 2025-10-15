import { cn } from "@/lib/utils";
import Image from "next/image";

interface LatestOfferCardProps {
  title?: string;
  description?: string;
  imageUrl?: string;
  discount?: string;
  originalPrice?: string;
  discountedPrice?: string;
  isNew?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function LatestOfferCard({
  title,
  imageUrl,
  onClick,
  className
}: LatestOfferCardProps) {
  return (
    <div 
  className={cn(
    "cursor-pointer relative overflow-hidden w-full sm:w-full group",
    className
  )}
  onClick={onClick}
>
  {/* Image container with flexible height */}
  <div className="w-full">
    {imageUrl ? (
      <div className="relative w-full">
        <Image 
          src={imageUrl || 'https://i.pinimg.com/736x/54/68/a3/5468a33bc43e258995f15ad01e5ad7cc.jpg'} 
          alt={title || 'Offer image'}
          width={600}
          height={120}
          className="w-full h-auto object-contain object-center group-hover:scale-105 transition-transform duration-300 ease-out max-w-full"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
      </div>
    ) : (
      <div 
        className="w-full h-[120px] sm:h-[140px] md:h-[160px] lg:h-[180px] flex items-center justify-center"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
      >
        <span className="text-white/60 text-sm">Hình ảnh ưu đãi</span>
      </div>
    )}
  </div>

  {/* Border overlay */}
  <div className="absolute inset-0 border-4 border-yellow-200 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
</div>

  );
}