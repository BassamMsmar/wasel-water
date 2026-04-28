"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { X, Crop as CropIcon } from "lucide-react";

const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  flip = { horizontal: false, vertical: false }
): Promise<File | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  const bBoxWidth =
    Math.abs(Math.cos(getRadianAngle(rotation)) * image.width) +
    Math.abs(Math.sin(getRadianAngle(rotation)) * image.height);
  const bBoxHeight =
    Math.abs(Math.sin(getRadianAngle(rotation)) * image.width) +
    Math.abs(Math.cos(getRadianAngle(rotation)) * image.height);

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(getRadianAngle(rotation));
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");

  if (!croppedCtx) return null;

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    croppedCanvas.toBlob((file) => {
      if (file) {
        resolve(new File([file], "cropped_image.jpg", { type: "image/jpeg" }));
      } else {
        resolve(null);
      }
    }, "image/jpeg", 0.95);
  });
}

type ImageCropperProps = {
  imageSrc: string;
  onCropComplete: (file: File) => void;
  onCancel: () => void;
};

export function ImageCropper({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    try {
      setIsProcessing(true);
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedFile) {
        onCropComplete(croppedFile);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b1a27]/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-[600px] rounded-[32px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#edf3f8] px-6 py-5">
          <div className="flex items-center gap-3 text-[#102231]">
            <CropIcon className="h-5 w-5 text-[#2d78c8]" />
            <h3 className="text-lg font-black">قص وضبط الصورة</h3>
          </div>
          <button
            onClick={onCancel}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#617386] transition hover:bg-[#f3f8fd] hover:text-[#102231]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative h-[400px] w-full bg-[#f8fbff]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="flex items-center justify-between border-t border-[#edf3f8] p-6">
          <div className="flex w-1/2 items-center gap-3">
            <span className="text-sm font-bold text-[#617386]">تكبير:</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-2 w-full appearance-none rounded-full bg-[#dbe8f3] accent-[#2d78c8]"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={isProcessing}
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary"
              disabled={isProcessing}
            >
              {isProcessing ? "جاري القص..." : "تأكيد القص"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
