import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { styleTokens } from '../theme';
import { scale } from '../utils/scale';

/**
 * Secondary Button Component
 * 
 * Features:
 * - Secondary button styling (nav CTA style)
 * - Pressed state with scale animation
 * - Disabled state with opacity
 * - Minimum touch target (48px)
 * - Theme-based styling
 * - Responsive font scaling
 * - Prevents text wrapping and clipping
 * 
 * Usage:
 * <ButtonSecondary title="Cancel" onPress={handleCancel} />
 * <ButtonSecondary title="Back" onPress={handleBack} disabled />
 */
export const ButtonSecondary = ({ 
  title, 
  onPress, 
  disabled = false, 
  style, 
  textStyle,
  ...props 
}) => {
  // Debug logging
  console.log('ButtonSecondary props:', { title, onPress, disabled, style });
  
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        disabled && styles.buttonDisabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={title}
      {...props}
    >
      <Text 
        style={[styles.buttonText, textStyle]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {title || 'Button'} {/* Fallback text if title is missing */}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: styleTokens.colors.primaryDark,
    paddingVertical: scale(7), // Scaled padding
    paddingHorizontal: scale(28), // Scaled padding
    borderRadius: scale(5), // Scaled border radius
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: scale(48), // Accessibility: minimum touch target
    minWidth: scale(100), // Minimum width to prevent squishing
    ...styleTokens.shadows.sm,
  },
  buttonPressed: {
    backgroundColor: styleTokens.colors.primary,
    transform: [{ scale: 0.98 }],
    ...styleTokens.shadows.md,
  },
  buttonDisabled: {
    opacity: 0.6,
    backgroundColor: styleTokens.colors.textMuted,
  },
  buttonText: {
    color: styleTokens.colors.white,
    fontSize: scale(13), // Scaled font size
    fontWeight: styleTokens.components.button.secondary.fontWeight,
    textTransform: 'uppercase',
    fontFamily: styleTokens.typography.fonts.robotoMono,
    letterSpacing: styleTokens.typography.letterSpacing.wide,
    textAlign: 'center',
    flexShrink: 1,
  },
});
