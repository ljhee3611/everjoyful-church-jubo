'use client'
import { supabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'

export default function Admin() {
  const [previews, setPreviews] = useState({})
  const [loading, setLoading] = useState({})
  const storageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images`

  useEffect(() => {
    fetchExisting()
  }, [])

  const fetchExisting = async () => {
    const { data } = await supabase.storage.from('images').list()
    if (data) {
      const currentPreviews = {}
      data.forEach(file => {
        const match = file.name.match(/image(\d+)\.jpg/)
        if (match) {
          currentPreviews[match[1]] = `${storageUrl}/${file.name}?t=${Date.now()}`
        }
      })
      setPreviews(currentPreviews)
    }
  }

  const uploadFile = async (file, index) => {
    if (!file) return
    setLoading(prev => ({ ...prev, [index]: true }))
    
    const { error } = await supabase.storage
      .from('images')
      .upload(`image${index}.jpg`, file, { upsert: true })

    if (error) {
      alert('업로드 실패: ' + error.message)
    } else {
      setPreviews(prev => ({
        ...prev,
        [index]: `${storageUrl}/image${index}.jpg?t=${Date.now()}`
      }))
    }
    setLoading(prev => ({ ...prev, [index]: false }))
  }

  // 🔥 삭제 함수 추가
  const deleteFile = async (index) => {
    if (!confirm(`${index}번 이미지를 삭제하시겠습니까?`)) return
    
    setLoading(prev => ({ ...prev, [index]: true }))
    const { error } = await supabase.storage
      .from('images')
      .remove([`image${index}.jpg`])

    if (error) {
      alert('삭제 실패: ' + error.message)
    } else {
      // 성공 시 미리보기 상태에서 제거
      const newPreviews = { ...previews }
      delete newPreviews[index]
      setPreviews(newPreviews)
    }
    setLoading(prev => ({ ...prev, [index]: false }))
  }

  const handleDrop = (e, index) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    uploadFile(file, index)
  }

  return (
  <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '40px 20px' }}>
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', color: '#1a1a1a', fontWeight: 'bold' }}>늘기쁜교회 주보 등록하기</h1>
      </header>

      <div style={{ display: 'grid', gap: '20px' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ position: 'relative' }}>
            {/* 🔥 Label을 전체 영역으로 씌워서 어디를 클릭해도 파일 선택이 되게 함 */}
            <label 
              onDrop={(e) => handleDrop(e, i)}
              onDragOver={(e) => e.preventDefault()}
              style={{
                backgroundColor: 'white', borderRadius: '12px', padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px',
                cursor: 'pointer', border: '2px dashed #ddd', transition: '0.2s', display: 'flex'
              }}
              className="slot-card"
            >
              {/* 실제 input은 숨김 */}
              <input 
                type="file" 
                onChange={(e) => uploadFile(e.target.files[0], i)} 
                style={{ display: 'none' }} 
              />

              {/* 미리보기 영역 */}
              <div style={{ 
                width: '100px', height: '100px', backgroundColor: '#f0f0f0', borderRadius: '8px',
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                {previews[i] ? (
                  <img src={previews[i]} alt={`Slot ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: '#aaa', fontSize: '24px' }}>+</span>
                )}
              </div>

              {/* 텍스트 안내 영역 */}
              <div style={{ flexGrow: 1 }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '17px', color: '#333' }}>{i}번 이미지 슬롯</h3>
                <p style={{ margin: 0, fontSize: '14px', color: previews[i] ? '#0070f3' : '#999' }}>
                  {previews[i] ? '✅ 이미지가 등록됨 (클릭하여 교체)' : '📂 파일을 드래그하거나 클릭하세요'}
                </p>
              </div>

              {/* 삭제 버튼 - label 안에 있으면 클릭 시 파일창이 뜨므로 stopPropagation 처리 */}
              {previews[i] && (
                <button 
                  onClick={(e) => {
                    e.preventDefault(); // 파일 창 뜨는 것 방지
                    e.stopPropagation(); // 이벤트 전파 방지
                    deleteFile(i);
                  }}
                  style={{
                    backgroundColor: '#fff1f0', color: '#ff4d4f', border: '1px solid #ffccc7',
                    padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold'
                  }}
                >
                  지우기
                </button>
              )}
            </label>

            {/* 로딩 표시 */}
            {loading[i] && (
              <div style={{ 
                position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.7)', 
                borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 
              }}>
                <span>업로드 중...</span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <a href="/" style={{ color: '#0070f3', textDecoration: 'none', fontSize: '15px' }}>
          주보 확인하러 가기 →
        </a>
      </div>
    </div>
  </div>
)
}