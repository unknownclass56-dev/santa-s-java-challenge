import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDeviceId = () => {
  const [deviceId, setDeviceId] = useState<string>('');
  const [hasPlayed, setHasPlayed] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [existingUsername, setExistingUsername] = useState<string | null>(null);

  useEffect(() => {
    const generateDeviceId = () => {
      // Create a fingerprint based on browser characteristics
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('device-fingerprint', 0, 0);
      }
      const canvasData = canvas.toDataURL();

      const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.colorDepth,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        canvasData.slice(-50),
      ].join('|');

      // Create a hash of the fingerprint
      let hash = 0;
      for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }

      return 'device_' + Math.abs(hash).toString(36) + '_' + Date.now().toString(36);
    };

    const initializeDeviceId = async () => {
      setIsChecking(true);

      // Check localStorage for existing device ID
      let storedId = localStorage.getItem('quiz_device_id');
      
      if (!storedId) {
        storedId = generateDeviceId();
        localStorage.setItem('quiz_device_id', storedId);
      }

      setDeviceId(storedId);

      // Check if this device has already played
      try {
        const { data, error } = await supabase
          .from('quiz_attempts')
          .select('username')
          .eq('device_id', storedId)
          .maybeSingle();

        if (error) {
          console.error('Error checking device:', error);
          setHasPlayed(false);
        } else if (data) {
          setHasPlayed(true);
          setExistingUsername(data.username);
        } else {
          setHasPlayed(false);
        }
      } catch (error) {
        console.error('Error checking device:', error);
        setHasPlayed(false);
      }

      setIsChecking(false);
    };

    initializeDeviceId();
  }, []);

  return { deviceId, hasPlayed, isChecking, existingUsername };
};
