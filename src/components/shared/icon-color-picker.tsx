'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { ANIMATION } from '@/lib/constants';

const ICON_PRESETS = [
  'Heart', 'Star', 'Bookmark', 'Flame', 'Zap', 'Target',
  'Trophy', 'Crown', 'Gem', 'Shield', 'Sword', 'Wand2',
  'Feather', 'Leaf', 'Sun', 'Moon', 'Cloud', 'Droplet',
  'Music', 'Palette', 'Camera', 'Gift', 'Rocket', 'Anchor',
] as const;

const COLOR_PRESETS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#6366f1', '#8b5cf6',
  '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
] as const;

interface IconColorPickerProps {
  selectedIcon: string;
  selectedColor: string;
  onIconChange: (icon: string) => void;
  onColorChange: (color: string) => void;
}

export function IconColorPicker({
  selectedIcon,
  selectedColor,
  onIconChange,
  onColorChange,
}: IconColorPickerProps) {
  const [activeTab, setActiveTab] = useState<'icon' | 'color'>('icon');

  return (
    <div className="space-y-3">
      {/* Tab Switcher */}
      <div className="flex rounded-lg bg-muted p-1">
        <button
          onClick={() => setActiveTab('icon')}
          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            activeTab === 'icon'
              ? 'bg-background shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Icon
        </button>
        <button
          onClick={() => setActiveTab('color')}
          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            activeTab === 'color'
              ? 'bg-background shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Color
        </button>
      </div>

      {/* Preview */}
      <div className="flex justify-center py-2">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${selectedColor}20` }}
        >
          <div
            className="h-6 w-6 rounded-md"
            style={{ backgroundColor: selectedColor }}
          />
        </div>
      </div>

      {/* Icon Grid */}
      {activeTab === 'icon' && (
        <motion.div
          initial={ANIMATION.FADE_TRANSITION.initial}
          animate={ANIMATION.FADE_TRANSITION.animate}
          className="grid grid-cols-8 gap-1.5"
        >
          {ICON_PRESETS.map((icon) => (
            <button
              key={icon}
              onClick={() => onIconChange(icon)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs transition-all ${
                selectedIcon === icon
                  ? 'ring-2 ring-offset-1'
                  : 'hover:bg-muted'
              }`}
              style={selectedIcon === icon ? { ringColor: selectedColor } : undefined}
            >
              {icon.charAt(0)}
            </button>
          ))}
        </motion.div>
      )}

      {/* Color Grid */}
      {activeTab === 'color' && (
        <motion.div
          initial={ANIMATION.FADE_TRANSITION.initial}
          animate={ANIMATION.FADE_TRANSITION.animate}
          className="grid grid-cols-8 gap-1.5"
        >
          {COLOR_PRESETS.map((color) => (
            <button
              key={color}
              onClick={() => onColorChange(color)}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-transform hover:scale-110"
              style={{ backgroundColor: color }}
            >
              {selectedColor === color && (
                <Check className="h-4 w-4 text-white" />
              )}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export { ICON_PRESETS, COLOR_PRESETS };
