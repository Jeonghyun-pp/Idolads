"use client";

// ============================================
// Cloudinary 이미지 업로더
// ============================================
// 
// 사용법:
// <ImageUploader onUpload={(url) => setImageUrl(url)} />
// ============================================

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

interface ImageUploaderProps {
  onUpload: (url: string) => void;
  currentImage?: string;
  folder?: string;
}

export function ImageUploader({ onUpload, currentImage, folder = 'fanplace' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);
  const [error, setError] = useState<string>();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 검증 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('파일 크기는 10MB를 초과할 수 없습니다.');
      return;
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setError(undefined);
    setUploading(true);

    try {
      // 1. 서명 받기
      const signResponse = await fetch('/api/upload/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder }),
      });

      if (!signResponse.ok) {
        throw new Error('서명 생성 실패');
      }

      const { timestamp, signature, cloudName, apiKey } = await signResponse.json();

      // 2. Cloudinary에 직접 업로드
      const formData = new FormData();
      formData.append('file', file);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('api_key', apiKey);
      formData.append('folder', folder);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error('업로드 실패');
      }

      const data = await uploadResponse.json();
      
      setPreview(data.secure_url);
      onUpload(data.secure_url);
    } catch (error) {
      console.error('Upload error:', error);
      setError('업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    onUpload('');
  };

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative">
          <Image
            src={preview}
            alt="Preview"
            width={400}
            height={300}
            className="rounded-lg object-cover w-full"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-white/40 transition">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-10 h-10 text-zinc-400 mb-3" />
            <p className="mb-2 text-sm text-zinc-400">
              <span className="font-semibold">클릭하여 업로드</span> 또는 드래그 앤 드롭
            </p>
            <p className="text-xs text-zinc-500">PNG, JPG, GIF (최대 10MB)</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      )}

      {uploading && (
        <div className="text-center text-sm text-zinc-400">업로드 중...</div>
      )}

      {error && (
        <div className="text-center text-sm text-red-400">{error}</div>
      )}
    </div>
  );
}

