'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [activeImages, setActiveImages] = useState([]) // 실제 있는 이미지 번호만 저장
  const storageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images`

  useEffect(() => {
    const fetchImages = async () => {
      const { data } = await supabase.storage.from('images').list()
      if (data) {
        // 실제 Storage에 존재하는 image1.jpg, image2.jpg... 파일들만 찾아서 번호를 뽑아냄
        const indices = data
          .map(file => {
            const match = file.name.match(/image(\d+)\.jpg/)
            return match ? parseInt(match[1]) : null
          })
          .filter(num => num !== null)
          .sort((a, b) => a - b) // 1, 2, 3 순서대로 정렬
        
        setActiveImages(indices)
      }
    }
    fetchImages()
  }, [])

  return (
    <main style={{ 
      width: '100%', display: 'flex', flexDirection: 'column', 
      gap: '5px', backgroundColor: 'white', minHeight: '100vh' 
    }}>
      {activeImages.map(i => (
        <img 
          key={i}
          src={`${storageUrl}/image${i}.jpg?t=${Date.now()}`}
          style={{ width: '100%', display: 'block', height: 'auto' }}
          alt="content"
        />
      ))}
    </main>
  )
}