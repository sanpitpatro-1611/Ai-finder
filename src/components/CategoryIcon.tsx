import React from 'react';
import {
  Image as ImageIcon,
  Video,
  Music,
  Code2,
  Globe,
  Layers,
  Palette,
  BookOpen,
  Cpu,
  CheckSquare,
  HelpCircle,
  LucideProps
} from 'lucide-react';
import { AICategory } from '../types';

interface CategoryIconProps extends LucideProps {
  category: AICategory | string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, ...props }) => {
  switch (category) {
    case 'image':
      return <ImageIcon {...props} />;
    case 'video':
      return <Video {...props} />;
    case 'audio':
      return <Music {...props} />;
    case 'coding':
      return <Code2 {...props} />;
    case 'website-builder':
      return <Globe {...props} />;
    case 'app-builder':
      return <Layers {...props} />;
    case 'design':
      return <Palette {...props} />;
    case 'research':
      return <BookOpen {...props} />;
    case 'local-ai':
      return <Cpu {...props} />;
    case 'productivity':
      return <CheckSquare {...props} />;
    default:
      return <HelpCircle {...props} />;
  }
};
