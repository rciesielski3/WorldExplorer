import React from 'react';
import { View, Text, Image, ImageSourcePropType } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { commonTokens } from '../../../theme/tokens';
import { Badge } from './Badge';
import { Card } from './Card';

interface QuestionCardProps {
  question: string;
  questionType: 'flag' | 'capital' | 'country';
  difficulty?: 'easy' | 'medium' | 'hard';
  flagSource?: ImageSourcePropType;
}

const difficultyConfig = {
  easy: { label: 'Easy', variant: 'success' as const, icon: 'star-outline' },
  medium: { label: 'Medium', variant: 'secondary' as const, icon: 'star-half-full' },
  hard: { label: 'Hard', variant: 'error' as const, icon: 'star' },
};

const questionTypeIcons = {
  flag: 'flag-outline',
  capital: 'building-outline',
  country: 'earth',
};

export function QuestionCard({
  question,
  questionType,
  difficulty = 'medium',
  flagSource,
}: QuestionCardProps) {
  const { theme } = useTheme();

  return (
    <Card style={{ marginBottom: commonTokens.spacing.lg }}>
      <View style={{ gap: commonTokens.spacing.md }}>
        {/* Header with type icon and difficulty badge */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: commonTokens.spacing.sm }}>
            <MaterialCommunityIcons
              name={questionTypeIcons[questionType]}
              size={20}
              color={theme.colors.primary}
            />
            <Text
              style={{
                color: theme.colors.textSecondary,
                fontSize: commonTokens.typography.bodySm.fontSize,
                fontFamily: commonTokens.typography.bodySm.fontFamily,
                textTransform: 'capitalize',
              }}
            >
              {questionType}
            </Text>
          </View>
          <Badge
            label={difficultyConfig[difficulty].label}
            icon={difficultyConfig[difficulty].icon}
            variant={difficultyConfig[difficulty].variant}
          />
        </View>

        {/* Flag image if present */}
        {flagSource && (
          <Image
            source={flagSource}
            style={{
              width: '100%',
              height: 140,
              borderRadius: commonTokens.borderRadius.md,
              marginVertical: commonTokens.spacing.sm,
            }}
            resizeMode="cover"
          />
        )}

        {/* Question text */}
        <Text
          style={{
            color: theme.colors.text,
            fontSize: commonTokens.typography.titleMd.fontSize,
            fontFamily: commonTokens.typography.titleMd.fontFamily,
            fontWeight: '600',
            lineHeight: commonTokens.typography.titleMd.lineHeight,
          }}
        >
          {question}
        </Text>
      </View>
    </Card>
  );
}
