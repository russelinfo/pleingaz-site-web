// src/components/ReviewForm.jsx
import React, { useState } from 'react'

const ReviewForm = () => {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [hoverRating, setHoverRating] = useState(0)
  const [profilePic, setProfilePic] = useState(null) // State for the profile picture

  const handleSubmit = (e) => {
    e.preventDefault()
    if (rating === 0) {
      alert('Veuillez donner une note en étoiles.')
      return
    }
    // Simulate API call to backend, including the profile picture file
    const formData = new FormData()
    formData.append('rating', rating)
    formData.append('comment', comment)
    if (profilePic) {
      formData.append('profilePic', profilePic) // Append the image file
    }

    console.log('Avis soumis:', {
      rating,
      comment,
      profilePic: profilePic ? profilePic.name : 'No image',
    })
    alert('Merci pour votre avis ! Il sera visible après validation.')

    // Clear the form
    setRating(0)
    setComment('')
    setProfilePic(null) // Reset the profile picture state
  }

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setProfilePic(event.target.files[0])
    }
  }

  const renderStars = () => {
    return [...Array(5)].map((_, i) => {
      const starRating = i + 1
      return (
        <span
          key={i}
          className={`text-3xl cursor-pointer transition-colors duration-200 ${
            starRating <= (hoverRating || rating)
              ? 'text-yellow-400'
              : 'text-gray-300'
          }`}
          onClick={() => setRating(starRating)}
          onMouseEnter={() => setHoverRating(starRating)}
          onMouseLeave={() => setHoverRating(0)}
        >
          ★
        </span>
      )
    })
  }

  return (
    <section className='bg-gray-50 py-20 px-4'>
      <div className='container mx-auto max-w-2xl'>
        <div className='bg-white rounded-2xl shadow-lg p-8 md:p-12'>
          <div className='text-center mb-8'>
            <h2 className='text-3xl font-extrabold text-gray-800 mb-2'>
              Laissez votre avis
            </h2>
            <p className='text-gray-600'>
              Partagez votre expérience avec la communauté Plein Gaz.
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className='mb-6'>
              <label
                className='block text-gray-700 text-lg font-bold mb-2'
                htmlFor='rating'
              >
                Votre note
              </label>
              <div className='flex items-center space-x-1'>{renderStars()}</div>
            </div>
            <div className='mb-6'>
              <label
                className='block text-gray-700 text-lg font-bold mb-2'
                htmlFor='comment'
              >
                Votre commentaire
              </label>
              <textarea
                id='comment'
                rows='6'
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-shadow'
                placeholder='Partagez votre expérience avec Plein Gaz...'
              ></textarea>
            </div>
            {/* Ajout du champ pour le téléchargement de l'avatar */}
            <div className='mb-6'>
              <label
                className='block text-gray-700 text-lg font-bold mb-2'
                htmlFor='profilePic'
              >
                Photo de profil (optionnel)
              </label>
              <input
                type='file'
                id='profilePic'
                accept='image/*' // Accepte seulement les fichiers image
                onChange={handleFileChange}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-shadow'
              />
            </div>
            <button
              type='submit'
              className='w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200'
            >
              Envoyer mon avis
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default ReviewForm
