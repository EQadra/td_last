// hooks/useProfileImage.ts
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDoctors } from '../context/DoctorContext';
import { getImageWithTimestamp } from '../utils/axios';

export const useProfileImage = () => {
  const { user } = useAuth();
  const { doctor, updateDoctorImage, fetchMyDoctor } = useDoctors();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getProfileImage = useCallback(() => {
    // ✅ PRIMERO: imagen del perfil doctor
    if (user?.profileType === 'doctor') {
      if (doctor?.image_url) return doctor.image_url;
      if (doctor?.image) return doctor.image;
    }
    // ✅ SEGUNDO: avatar del usuario
    if (user?.avatar_url) return user.avatar_url;
    if (user?.avatar) return user.avatar;
    return null;
  }, [user, doctor]);

  const refreshProfileImage = useCallback(async () => {
    setIsLoading(true);
    try {
      // ✅ Usar fetchMyDoctor para obtener datos actualizados
      await fetchMyDoctor();
      const image = getProfileImage();
      if (image) {
        setProfileImage(getImageWithTimestamp(image));
      }
    } catch (error) {
      console.log('Error refreshing profile image:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchMyDoctor, getProfileImage]);

  useEffect(() => {
    const image = getProfileImage();
    if (image) {
      setProfileImage(getImageWithTimestamp(image));
    } else {
      setProfileImage(null);
    }
  }, [getProfileImage]);

  const updateProfileImage = useCallback(async (imageUri: string) => {
    setIsLoading(true);
    try {
      let result;
      
      // ✅ Si es doctor, usar updateDoctorImage
      if (user?.profileType === 'doctor') {
        result = await updateDoctorImage(imageUri);
        if (result?.image) {
          const newImage = getImageWithTimestamp(result.image);
          setProfileImage(newImage);
          return newImage;
        }
        if (result?.image_url) {
          const newImage = getImageWithTimestamp(result.image_url);
          setProfileImage(newImage);
          return newImage;
        }
      }
      
      throw new Error('No se pudo actualizar la imagen');
    } catch (error) {
      console.error('Error updating profile image:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user?.profileType, updateDoctorImage]);

  return { 
    profileImage, 
    isLoading, 
    refreshProfileImage, 
    updateProfileImage,
    getProfileImage 
  };
};