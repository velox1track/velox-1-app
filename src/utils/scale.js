import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const baseWidth = 375; // iPhone X base width

/**
 * Responsive scaling utility for typography and spacing
 * Scales values based on screen width relative to base width (375px)
 * 
 * @param {number} size - Base size to scale
 * @param {number} base - Base screen width (default: 375)
 * @returns {number} Scaled size rounded to nearest pixel
 */
export const scale = (size, base = baseWidth) => {
  const scaleFactor = SCREEN_WIDTH / base;
  const newSize = size * scaleFactor;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Scale font sizes with responsive line heights
 * @param {number} fontSize - Base font size
 * @param {number} lineHeightMultiplier - Line height multiplier (default: 1.2)
 * @returns {object} Object with scaled fontSize and lineHeight
 */
export const scaleFont = (fontSize, lineHeightMultiplier = 1.2) => ({
  fontSize: scale(fontSize),
  lineHeight: scale(fontSize * lineHeightMultiplier),
});

/**
 * Scale spacing values
 * @param {number} spacing - Base spacing value
 * @returns {number} Scaled spacing
 */
export const scaleSpacing = (spacing) => scale(spacing);

export default scale;
