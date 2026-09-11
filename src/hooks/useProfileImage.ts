// hooks/useProfileImage.ts - CORREGIDO PARA TODOS LOS PERFILES
import { useCallback, useEffect, useState } from 'react';
import { useAssociations } from '../context/AssociationContext';
import { useAuth } from '../context/AuthContext';
import { useDoctors } from '../context/DoctorContext';
import { useLawyers } from '../context/LawyerContext';
import { useShops } from '../context/ShopContext';
import { getImageWithTimestamp } from '../utils/axios';

export const useProfileImage = () => {
  const { user } = useAuth();
  
  // ✅ TODOS LOS CONTEXTOS DE PERFIL
  const { doctor, updateDoctorImage, fetchMyDoctor } = useDoctors();
  const { lawyer, updateLawyerImage, fetchMyLawyer } = useLawyers();
  const { association, updateAssociationImage, fetchMyAssociation } = useAssociations();
  const { shop, updateShopImage, fetchMyShop } = useShops();
  
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ============================================================
  // OBTENER LA IMAGEN DEL PERFIL SEGÚN EL TIPO
  // ============================================================
  const getProfileImage = useCallback(() => {
    const type = user?.profileType;

    // ✅ DOCTOR
    if (type === 'doctor') {
      if (doctor?.image_url) return doctor.image_url;
      if (doctor?.image) return doctor.image;
    }
    
    // ✅ LAWYER
    if (type === 'lawyer') {
      if (lawyer?.image_url) return lawyer.image_url;
      if (lawyer?.image) return lawyer.image;
    }
    
    // ✅ ASSOCIATION
    if (type === 'association') {
      if (association?.image_url) return association.image_url;
      if (association?.image) return association.image;
    }
    
    // ✅ SHOP
    if (type === 'shop') {
      if (shop?.image_url) return shop.image_url;
      if (shop?.image) return shop.image;
    }
    
    // ✅ FALLBACK: avatar del usuario
    if (user?.avatar_url) return user.avatar_url;
    if (user?.avatar) return user.avatar;
    
    return null;
  }, [user, doctor, lawyer, association, shop]);

  // ============================================================
  // OBTENER FUNCIÓN DE ACTUALIZACIÓN SEGÚN TIPO
  // ============================================================
  const getUpdateFunction = useCallback(() => {
    const type = user?.profileType;
    
    switch (type) {
      case 'doctor': return updateDoctorImage;
      case 'lawyer': return updateLawyerImage;
      case 'association': return updateAssociationImage;
      case 'shop': return updateShopImage;
      default: return null;
    }
  }, [user, updateDoctorImage, updateLawyerImage, updateAssociationImage, updateShopImage]);

  // ============================================================
  // OBTENER FUNCIÓN DE FETCH SEGÚN TIPO
  // ============================================================
  const getFetchFunction = useCallback(() => {
    const type = user?.profileType;
    
    switch (type) {
      case 'doctor': return fetchMyDoctor;
      case 'lawyer': return fetchMyLawyer;
      case 'association': return fetchMyAssociation;
      case 'shop': return fetchMyShop;
      default: return null;
    }
  }, [user, fetchMyDoctor, fetchMyLawyer, fetchMyAssociation, fetchMyShop]);

  // ============================================================
  // REFRESCAR IMAGEN DE PERFIL
  // ============================================================
  const refreshProfileImage = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchFn = getFetchFunction();
      if (fetchFn) {
        await fetchFn();
      }
      
      const image = getProfileImage();
      if (image) {
        setProfileImage(getImageWithTimestamp(image));
      } else {
        setProfileImage(null);
      }
    } catch (error) {
      console.log('❌ Error refreshing profile image:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getFetchFunction, getProfileImage]);

  // ============================================================
  // ACTUALIZAR IMAGEN DE PERFIL
  // ============================================================
  const updateProfileImage = useCallback(async (imageUri: string) => {
    setIsLoading(true);
    try {
      const updateFn = getUpdateFunction();
      
      if (updateFn) {
        const result = await updateFn(imageUri);
        
        let newImage = null;
        if (result?.image) {
          newImage = getImageWithTimestamp(result.image);
        } else if (result?.image_url) {
          newImage = getImageWithTimestamp(result.image_url);
        }
        
        if (newImage) {
          setProfileImage(newImage);
          return newImage;
        }
      }
      
      throw new Error('No se pudo actualizar la imagen');
    } catch (error) {
      console.error('❌ Error updating profile image:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [getUpdateFunction]);

  // ============================================================
  // EFECTO PARA CARGAR LA IMAGEN INICIAL
  // ============================================================
  useEffect(() => {
    const image = getProfileImage();
    if (image) {
      setProfileImage(getImageWithTimestamp(image));
    } else {
      setProfileImage(null);
    }
  }, [getProfileImage]);

  return { 
    profileImage,
    isLoading,
    refreshProfileImage,
    updateProfileImage,
    getProfileImage,
  };
};