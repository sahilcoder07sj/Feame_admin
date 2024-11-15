import { cn } from "@/lib/utils";
import { useState } from "react";
import { Skeleton } from "../ui/skeleton";

const Shimmer = () => {
    return (
        <Skeleton className='w-full h-[300px] dark:bg-black' />
    );
};


const ImageWithShimmer = ({ src, alt, className = "", ...props }) => {
    const [isLoading, setIsLoading] = useState(true);

    const handleImageLoaded = () => {
        setIsLoading(false);
    };
    console.log(isLoading)
    return (
        <div className="relative w-full h-full">
            {isLoading && <Shimmer />}
            <img
                src={src}
                alt={alt}
                className={cn(isLoading ? "hidden" : "block", className)}
                onLoad={handleImageLoaded}
                {...props}
            />
        </div>
    );
};

export default ImageWithShimmer;