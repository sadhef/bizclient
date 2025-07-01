import React from 'react';
import {
  // Essential UI Icons
  FaUser,
  FaUsers,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSearch,
  FaEdit,
  FaTrash,
  FaPlus,
  FaMinus,
  FaTimes,
  FaCheck,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimesCircle,
  
  // Navigation Icons
  FaHome,
  FaTachometerAlt,
  FaCog,
  FaArrowLeft,
  FaArrowRight,
  FaChevronLeft,
  FaChevronRight,
  FaChevronUp,
  FaChevronDown,
  FaBars,
  
  // Status & Progress
  FaSpinner,
  FaClock,
  FaBell,
  FaSignOutAlt,
  
  // Content Icons
  FaFile,
  FaFolder,
  FaDownload,
  FaUpload,
  FaImage,
  
  // Common Actions
  FaSave,
  FaCopy,
  FaShare,
  FaLink,
  
  // Theme & Display
  FaSun,
  FaMoon,
  
  // Learning & Achievement
  FaTrophy,
  FaStar,
  FaFire,
  FaCode,
  
  // Toggle & Controls
  FaToggleOn,
  FaToggleOff,
  FaPlay,
  FaPause,
  
  // Social
  FaGithub,
  FaLinkedin,
  FaTwitter,
  
  // Misc Essential
  FaHeart,
  FaFlag,
  FaFilter
} from 'react-icons/fa';

// Minimal icon mapping - only essential icons
const Icons = {
  // User & Auth
  user: FaUser,
  users: FaUsers,
  envelope: FaEnvelope,
  lock: FaLock,
  eye: FaEye,
  eyeSlash: FaEyeSlash,
  signOut: FaSignOutAlt,
  
  // Navigation
  home: FaHome,
  dashboard: FaTachometerAlt,
  cog: FaCog,
  arrowLeft: FaArrowLeft,
  arrowRight: FaArrowRight,
  chevronLeft: FaChevronLeft,
  chevronRight: FaChevronRight,
  chevronUp: FaChevronUp,
  chevronDown: FaChevronDown,
  bars: FaBars,
  
  // Actions
  search: FaSearch,
  edit: FaEdit,
  trash: FaTrash,
  plus: FaPlus,
  minus: FaMinus,
  times: FaTimes,
  check: FaCheck,
  save: FaSave,
  copy: FaCopy,
  share: FaShare,
  link: FaLink,
  
  // Status
  checkCircle: FaCheckCircle,
  exclamationTriangle: FaExclamationTriangle,
  infoCircle: FaInfoCircle,
  timesCircle: FaTimesCircle,
  spinner: FaSpinner,
  clock: FaClock,
  bell: FaBell,
  
  // Content
  file: FaFile,
  folder: FaFolder,
  download: FaDownload,
  upload: FaUpload,
  image: FaImage,
  
  // Theme
  sun: FaSun,
  moon: FaMoon,
  
  // Learning
  trophy: FaTrophy,
  star: FaStar,
  fire: FaFire,
  code: FaCode,
  
  // Controls
  toggleOn: FaToggleOn,
  toggleOff: FaToggleOff,
  play: FaPlay,
  pause: FaPause,
  
  // Social
  github: FaGithub,
  linkedin: FaLinkedin,
  twitter: FaTwitter,
  
  // Misc
  heart: FaHeart,
  flag: FaFlag,
  filter: FaFilter
};

// Simple Icon component
const Icon = ({ name, size = 16, color, className = '', ...props }) => {
  const IconComponent = Icons[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <IconComponent 
      className={className}
      style={{ width: size, height: size, color }}
      {...props}
    />
  );
};

// Export only essential icons
export {
  FaUser,
  FaUsers,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSearch,
  FaEdit,
  FaTrash,
  FaPlus,
  FaTimes,
  FaCheck,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaHome,
  FaTachometerAlt,
  FaCog,
  FaChevronLeft,
  FaChevronRight,
  FaSpinner,
  FaClock,
  FaBell,
  FaSignOutAlt,
  FaSun,
  FaMoon,
  FaTrophy,
  FaStar,
  FaFire,
  FaCode,
  FaToggleOn,
  FaToggleOff,
  FaGithub,
  FaHeart
};

export { Icons, Icon };
export default Icons;