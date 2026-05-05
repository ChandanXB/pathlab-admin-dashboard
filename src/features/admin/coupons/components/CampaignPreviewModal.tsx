import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Button,
  Box,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import axiosInstance from '@/config/apiClient';
import colors from '@/styles/colors';
import dayjs from 'dayjs';

interface CampaignPreviewModalProps {
  open: boolean;
  onClose: () => void;
  campaign: any;
}

const CampaignPreviewModal: React.FC<CampaignPreviewModalProps> = ({ open, onClose, campaign }) => {
  const [targetName, setTargetName] = useState<string>('');
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchTargetName = async () => {
      if (!campaign?.coupon) {
        setTargetName('');
        return;
      }

      const { applicableTo, applicableIds } = campaign.coupon;
      if (applicableTo === 'test' && applicableIds?.length > 0) {
        try {
          const res = await axiosInstance.get(`/lab-tests/${applicableIds[0]}`);
          if (res.data.success) setTargetName(res.data.data.test_name);
        } catch (e) { console.error(e); }
      } else if (applicableTo === 'package' && applicableIds?.length > 0) {
        try {
          const res = await axiosInstance.get(`/routine-checkups/${applicableIds[0]}`);
          if (res.data.success) setTargetName(res.data.data.title);
        } catch (e) { console.error(e); }
      } else if (applicableTo === 'all') {
        setTargetName('All Tests & Packages');
      } else {
        setTargetName('');
      }
    };

    if (open && campaign) {
      fetchTargetName();
    }
  }, [open, campaign]);

  if (!campaign) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullScreen={fullScreen}
      disableScrollLock
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          background: 'none'
        }
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: fullScreen ? 'column' : 'row',
          bgcolor: 'background.paper',
          minHeight: fullScreen ? 'auto' : '400px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 12,
              top: 12,
              color: 'grey.500',
              zIndex: 10,
              bgcolor: `${colors.white}cc`,
              backdropFilter: 'blur(4px)',
              '&:hover': { bgcolor: colors.white, color: 'error.main' }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          {/* Banner Image Section */}
          <Box sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 0,
            overflow: 'hidden',
            position: 'relative'
          }}>
            {campaign.bannerImage ? (
              <img
                src={campaign.bannerImage}
                alt={campaign.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            ) : (
              <Box sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${colors.marketing.bannerGradient[0]} 0%, ${colors.marketing.bannerGradient[1]} 100%)`,
                color: colors.white,
                p: 4,
                textAlign: 'center'
              }}>
                <Typography variant="h4" fontWeight="900" sx={{ opacity: 0.2 }}>OFFER</Typography>
              </Box>
            )}

            {fullScreen && (
              <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '60px',
                background: `linear-gradient(to top, ${colors.white}, transparent)`
              }} />
            )}
          </Box>

          {/* Content Section */}
          <Box sx={{
            flex: 1.1,
            p: { xs: 3, md: 4 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: fullScreen ? 'center' : 'left',
            bgcolor: colors.white
          }}>
            <Typography
              variant="overline"
              sx={{
                color: colors.primary,
                fontWeight: 800,
                letterSpacing: 1.5,
                mb: 0.5,
                display: 'block',
                fontSize: '0.7rem'
              }}
            >
              SPECIAL CAMPAIGN (PREVIEW)
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                mb: 1,
                color: colors.marketing.title,
                lineHeight: 1.2,
                fontSize: { xs: '1.5rem', md: '1.8rem' },
                textTransform: 'capitalize'
              }}
            >
              {campaign.title}
            </Typography>
            {campaign.subtitle && (
              <Typography
                sx={{
                  mb: 1.5,
                  color: colors.marketing.subtitle,
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textTransform: 'capitalize'
                }}
              >
                {campaign.subtitle}
              </Typography>
            )}
            <Typography
              sx={{
                mb: 2.5,
                color: colors.marketing.description,
                fontSize: '0.9rem',
                lineHeight: 1.5,
                textTransform: 'capitalize'
              }}
            >
              {campaign.description}
            </Typography>

            {campaign.coupon && (
              <Box sx={{
                mb: 2,
                p: 1.5,
                border: `1.5px dashed ${colors.marketing.couponBorder}`,
                borderRadius: '12px',
                bgcolor: colors.marketing.couponBg,
                textAlign: 'center'
              }}>
                <Typography variant="caption" sx={{ color: colors.marketing.label, fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 0.5, fontSize: '0.65rem' }}>
                  Use Coupon Code
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: colors.primary, letterSpacing: 1, fontFamily: 'monospace' }}>
                  {campaign.coupon.code}
                </Typography>
              </Box>
            )}

            {targetName && (
              <Box sx={{ mb: 2.5, textAlign: fullScreen ? 'center' : 'left' }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: colors.marketing.label, 
                    fontWeight: 800, 
                    textTransform: 'uppercase', 
                    letterSpacing: 0.5,
                    display: 'block',
                    mb: 0.2,
                    fontSize: '0.65rem'
                  }}
                >
                  Applicable On
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: colors.marketing.targetText, 
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    textTransform: 'capitalize'
                  }}
                >
                  {targetName}
                </Typography>
              </Box>
            )}

            {campaign.coupon?.endDate && (
              <Box sx={{ 
                mb: 3, 
                display: 'flex',
                justifyContent: fullScreen ? 'center' : 'flex-start'
              }}>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 0.8,
                  borderRadius: '100px',
                  background: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)',
                  border: '1px solid #FFE082',
                  boxShadow: '0 4px 10px rgba(255, 193, 7, 0.15)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent)',
                    animation: 'shimmer 2s infinite',
                  },
                  '@keyframes shimmer': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' }
                  }
                }}>
                  <AccessTimeIcon sx={{ color: '#FF8F00', fontSize: '1.1rem' }} />
                  <Typography 
                    sx={{ 
                      color: '#BF360C',
                      fontWeight: 800, 
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.3px'
                    }}
                  >
                    ENDS ON: {dayjs(campaign.coupon.endDate).format('DD MMM, YYYY')}
                  </Typography>
                </Box>
              </Box>
            )}

            <Button
              variant="contained"
              size="large"
              fullWidth
              sx={{
                py: 1.8,
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 800,
                textTransform: 'none',
                boxShadow: `0 10px 15px -3px ${colors.primary}4d`,
                bgcolor: colors.primary,
                '&:hover': {
                  bgcolor: colors.primary,
                  opacity: 0.9,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 15px 20px -5px ${colors.primary}66`,
                },
                transition: 'all 0.2s'
              }}
            >
              {campaign.ctaText || 'Claim This Offer'}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CampaignPreviewModal;
