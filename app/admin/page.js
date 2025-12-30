'use client'
import { supabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'

export default function Admin() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [previews, setPreviews] = useState({})
  const [loading, setLoading] = useState({})
  
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD
  const storageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images`

  // 1. 페이지 로드 시 로컬 스토리지 확인
  useEffect(() => {
    const savedPassword = localStorage.getItem('admin_pwd')
    if (savedPassword === ADMIN_PASSWORD) {
      setIsAuthorized(true)
    }
  }, [ADMIN_PASSWORD]) // 비밀번호가 환경변수에서 로드되면 실행

  // 2. 인증 성공 시 데이터 불러오기
  useEffect(() => {
    if (isAuthorized) {
      fetchExisting()
    }
  }, [isAuthorized])

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

  // 3. 비밀번호 확인 및 저장 로직
  const handleLogin = (e) => {
    e.preventDefault()
    if (passwordInput === ADMIN_PASSWORD) {
      localStorage.setItem('admin_pwd', passwordInput) // 브라우저에 비밀번호 저장
      setIsAuthorized(true)
    } else {
      alert('비밀번호가 틀렸습니다.')
      setPasswordInput('')
    }
  }

  // 4. 로그아웃 (저장된 비번 삭제)
  const handleLogout = () => {
    if (confirm('로그아웃하시겠습니까? 다음 접속 시 비밀번호를 다시 입력해야 합니다.')) {
      localStorage.removeItem('admin_pwd')
      setIsAuthorized(false)
    }
  }

  // --- 업로드/삭제 함수는 이전과 동일 ---
  const uploadFile = async (file, index) => {
    if (!file) return
    setLoading(prev => ({ ...prev, [index]: true }))
    const { error } = await supabase.storage.from('images').upload(`image${index}.jpg`, file, { upsert: true })
    if (!error) {
      setPreviews(prev => ({ ...prev, [index]: `${storageUrl}/image${index}.jpg?t=${Date.now()}` }))
      await supabase.from('image_status').update({ last_updated: new Date().toISOString() }).eq('id', 1)
    }
    setLoading(prev => ({ ...prev, [index]: false }))
  }

  const deleteFile = async (index) => {
    if (!confirm(`${index}번 이미지를 삭제하시겠습니까?`)) return
    setLoading(prev => ({ ...prev, [index]: true }))
    const { error } = await supabase.storage.from('images').remove([`image${index}.jpg`])
    if (!error) {
      const newPreviews = { ...previews }; delete newPreviews[index]; setPreviews(newPreviews)
      await supabase.from('image_status').update({ last_updated: new Date().toISOString() }).eq('id', 1)
    }
    setLoading(prev => ({ ...prev, [index]: false }))
  }

  const handleDrop = (e, index) => {
    e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) uploadFile(file, index)
  }

  // --- 화면 렌더링 ---
  if (!isAuthorized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
        <form onSubmit={handleLogin} style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '20px', color: '#333' }}>주보 관리자 인증</h2>
          <input 
            type="password" placeholder="비밀번호 입력" value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            style={{ padding: '12px', width: '220px', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '15px', display: 'block' }}
          />
          <button type="submit" style={{ padding: '12px 20px', width: '100%', borderRadius: '6px', border: 'none', backgroundColor: '#0070f3', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
            접속하기
          </button>
          <p style={{ fontSize: '12px', color: '#999', marginTop: '15px' }}>이 브라우저에 로그인 상태가 유지됩니다.</p>
        </form>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', color: '#1a1a1a', margin: 0 }}>주보 관리 센터</h1>
          <button onClick={handleLogout} style={{ color: '#666', border: '1px solid #ccc', padding: '5px 12px', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer' }}>
            로그아웃
          </button>
        </div>

        <div style={{ display: 'grid', gap: '20px' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ position: 'relative' }}>
              <label onDrop={(e) => handleDrop(e, i)} onDragOver={(e) => e.preventDefault()} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', border: '2px dashed #ddd', transition: '0.2s' }}>
                <input type="file" onChange={(e) => uploadFile(e.target.files[0], i)} style={{ display: 'none' }} />
                <div style={{ width: '80px', height: '80px', backgroundColor: '#f0f0f0', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {previews[i] ? <img src={previews[i]} alt={`Slot ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#aaa', fontSize: '20px' }}>+</span>}
                </div>
                <div style={{ flexGrow: 1 }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#333' }}>{i}번 이미지 슬롯</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: previews[i] ? '#0070f3' : '#999' }}>{previews[i] ? '✅ 등록됨 (클릭하여 교체)' : '📂 파일을 드래그하거나 클릭'}</p>
                </div>
                {previews[i] && <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteFile(i); }} style={{ backgroundColor: '#fff1f0', color: '#ff4d4f', border: '1px solid #ffccc7', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>삭제</button>}
              </label>
              {loading[i] && <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}><span>처리 중...</span></div>}
            </div>
          ))}
        </div>
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <a href="/" style={{ color: '#0070f3', textDecoration: 'none', fontWeight: 'bold' }}>주보 확인하러 가기 →</a>
        </div>
      </div>
    </div>
  )
}