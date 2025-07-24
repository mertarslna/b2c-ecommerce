// src/app/profile/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, updateProfile } = useUser()
  const router = useRouter()
  
  // Form states
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: ''
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: '',
        address: '',
        city: '',
        country: ''
      })
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async () => {
    setIsUpdating(true)
    const success = await updateProfile({
      name: formData.name,
      email: formData.email
    })
    
    if (success) {
      setIsEditing(false)
    }
    setIsUpdating(false)
  }

  const handleCancelEdit = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: '',
        address: '',
        city: '',
        country: ''
      })
    }
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-pink-600">Loading Profile...</h2>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Header />
      
      {/* Breadcrumb */}
      <div className="container mx-auto px-6 py-6">
        <nav className="text-sm">
          <ol className="flex items-center space-x-2">
            <li>
              <a href="/" className="text-gray-500 hover:text-pink-600 transition-colors">Home</a>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-pink-600 font-semibold">My Profile</li>
          </ol>
        </nav>
      </div>

      <div className="container mx-auto px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          
          {/* Profile Header */}
          <div className="bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-pink-500 via-red-400 to-purple-500 h-32 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 to-purple-600/20"></div>
            </div>
            
            <div className="relative px-8 pb-8">
              {/* Avatar */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-4xl font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  {/* Avatar Edit Button */}
                  <button 
                    onClick={() => setShowAvatarModal(true)}
                    className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg hover:bg-pink-50 hover:scale-110 transition-all group"
                  >
                    <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
                  <p className="text-xl text-gray-600 mb-2">{user.email}</p>
                  <div className="flex items-center justify-center sm:justify-start gap-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Member since {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Verified Account
                    </span>
                  </div>
                </div>

                {/* Edit Button */}
                <div className="flex gap-3">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-pink-500 to-red-400 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-red-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isUpdating}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
                      >
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Personal Information */}
              <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full p-4 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                      />
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-xl text-gray-800">{user.name}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Email Address</label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-4 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                      />
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-xl text-gray-800">{user.email}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Phone Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Add your phone number"
                        className="w-full p-4 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                      />
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-xl text-gray-800">
                        {formData.phone || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Country</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder="Add your country"
                        className="w-full p-4 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                      />
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-xl text-gray-800">
                        {formData.country || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Address</label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Add your address"
                      rows={3}
                      className="w-full p-4 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors resize-none"
                    />
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-xl text-gray-800">
                      {formData.address || 'Not provided'}
                    </div>
                  )}
                </div>
              </div>

              {/* Security Settings */}
              <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Security Settings
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h3 className="font-semibold text-gray-800">Password</h3>
                      <p className="text-sm text-gray-600">Last updated 30 days ago</p>
                    </div>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="bg-gradient-to-r from-pink-500 to-red-400 text-white px-4 py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-red-500 transition-all duration-300"
                    >
                      Change Password
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h3 className="font-semibold text-gray-800">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-600">Add an extra layer of security</p>
                    </div>
                    <button className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors">
                      Enable
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              
              {/* Quick Stats */}
              <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Account Overview</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Orders</span>
                    <span className="font-bold text-pink-600">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Wishlist Items</span>
                    <span className="font-bold text-pink-600">5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Reviews Written</span>
                    <span className="font-bold text-pink-600">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Account Status</span>
                    <span className="font-bold text-green-600">Active</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                <div className="space-y-3">
                  <a href="/orders" className="block w-full text-left p-3 rounded-xl hover:bg-pink-50 hover:text-pink-600 transition-colors">
                    📦 View Orders
                  </a>
                  <a href="/wishlist" className="block w-full text-left p-3 rounded-xl hover:bg-pink-50 hover:text-pink-600 transition-colors">
                    ❤️ My Wishlist
                  </a>
                  <a href="/cart" className="block w-full text-left p-3 rounded-xl hover:bg-pink-50 hover:text-pink-600 transition-colors">
                    🛒 Shopping Cart
                  </a>
                  <a href="/help" className="block w-full text-left p-3 rounded-xl hover:bg-pink-50 hover:text-pink-600 transition-colors">
                    🆘 Help & Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <PasswordChangeModal onClose={() => setShowPasswordModal(false)} />
      )}

      {/* Avatar Change Modal */}
      {showAvatarModal && (
        <AvatarChangeModal 
          currentAvatar={user.avatar}
          userName={user.name}
          onClose={() => setShowAvatarModal(false)} 
          onAvatarUpdate={(newAvatar) => {
            updateProfile({ avatar: newAvatar })
            setShowAvatarModal(false)
          }}
        />
      )}
    </div>
  )
}

// Avatar Change Modal Component
function AvatarChangeModal({ 
  currentAvatar, 
  userName, 
  onClose, 
  onAvatarUpdate 
}: { 
  currentAvatar?: string
  userName: string
  onClose: () => void
  onAvatarUpdate: (avatar: string) => void
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  // Predefined avatar options
  const avatarOptions = [
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
  ]

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const uploadCustomAvatar = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    
    // Simulate upload - في التطبيق الحقيقي، ترفع للserver
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // For demo, use the preview URL
    onAvatarUpdate(previewUrl!)
    setIsUploading(false)
  }

  const selectPredefinedAvatar = (avatarUrl: string) => {
    onAvatarUpdate(avatarUrl)
  }

  const generateInitialsAvatar = () => {
    const initials = userName.charAt(0).toUpperCase()
    const colors = ['ff6b9d', 'c44569', '6c5ce7', 'a29bfe', '74b9ff', '0984e3']
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${randomColor}&color=fff&size=150&bold=true`
    onAvatarUpdate(avatarUrl)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Change Profile Picture</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Current Avatar */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
            {currentAvatar ? (
              <img src={currentAvatar} alt="Current" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-2xl font-bold">{userName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <p className="text-gray-600">Current Profile Picture</p>
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Upload Custom Photo</h4>
          
          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
              dragActive 
                ? 'border-pink-500 bg-pink-50' 
                : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
            onDragLeave={() => setDragActive(false)}
          >
            {previewUrl ? (
              <div className="space-y-4">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-lg"
                />
                <div className="space-y-3">
                  <button
                    onClick={uploadCustomAvatar}
                    disabled={isUploading}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Uploading...
                      </span>
                    ) : (
                      'Use This Photo'
                    )}
                  </button>
                  <button
                    onClick={() => { setSelectedFile(null); setPreviewUrl(null) }}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Choose Different Photo
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full mx-auto flex items-center justify-center">
                  <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800 mb-2">Drop your photo here</p>
                  <p className="text-gray-600 mb-4">or click to browse</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="bg-gradient-to-r from-pink-500 to-red-400 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-red-500 transition-all duration-300 cursor-pointer inline-block"
                  >
                    Choose Photo
                  </label>
                </div>
                <p className="text-sm text-gray-500">JPG, PNG or GIF (max 5MB)</p>
              </div>
            )}
          </div>
        </div>

        {/* Predefined Avatars */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Choose from Gallery</h4>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {avatarOptions.map((avatar, index) => (
              <button
                key={index}
                onClick={() => selectPredefinedAvatar(avatar)}
                className="w-20 h-20 rounded-full overflow-hidden hover:scale-110 hover:shadow-lg transition-all duration-300 border-4 border-white hover:border-pink-300"
              >
                <img 
                  src={avatar} 
                  alt={`Avatar option ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Generate Initials Avatar */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Generate Avatar</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 font-medium">Use Initials Avatar</p>
              <p className="text-sm text-gray-500">Generate a colorful avatar with your initials</p>
            </div>
            <button
              onClick={generateInitialsAvatar}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
            >
              Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Password Change Modal Component
function PasswordChangeModal({ onClose }: { onClose: () => void }) {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setError('All fields are required')
      return
    }

    if (passwords.new !== passwords.confirm) {
      setError('New passwords do not match')
      return
    }

    if (passwords.new.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    
    // Mock password change
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Show success notification
    const notification = document.createElement('div')
    notification.textContent = '✅ Password changed successfully!'
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 transform translate-x-full transition-transform duration-300'
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.style.transform = 'translateX(0)'
    }, 100)
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)'
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)

    setIsLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Change Password</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
              className="w-full p-4 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwords.new}
              onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
              className="w-full p-4 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
              className="w-full p-4 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-pink-500 to-red-400 text-white py-4 rounded-xl font-semibold hover:from-pink-600 hover:to-red-500 transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? 'Changing...' : 'Change Password'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white py-4 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}