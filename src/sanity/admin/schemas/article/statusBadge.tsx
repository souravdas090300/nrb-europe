'use client';

import React from 'react';
import { StringInputProps, useFormValue } from 'sanity';
import { Badge, Flex, Box } from '@sanity/ui';

const STATUS_CONFIG: Record<string, { title: string; tone: string; icon: string }> = {
  draft: {
    title: 'Draft',
    tone: 'default',
    icon: '💭',
  },
  review: {
    title: 'Under Review',
    tone: 'caution',
    icon: '👁️',
  },
  approved: {
    title: 'Approved',
    tone: 'positive',
    icon: '✅',
  },
  published: {
    title: 'Published',
    tone: 'primary',
    icon: '🚀',
  },
  archived: {
    title: 'Archived',
    tone: 'critical',
    icon: '📦',
  },
};

export default function StatusBadge(props: StringInputProps) {
  const { value } = props;
  const status = (value as string) || 'draft';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  
  const isBreakingNews = useFormValue(['isBreakingNews']) as boolean;
  const scheduledPublish = useFormValue(['scheduledPublish']) as string;
  
  return (
    <Flex direction="column" gap={3}>
      <Flex gap={2} align="center">
        <Badge tone={config.tone as any} padding={2} radius={2}>
          <Flex align="center" gap={2}>
            <Box>{config.icon}</Box>
            <Box>{config.title}</Box>
          </Flex>
        </Badge>
        
        {isBreakingNews && (
          <Badge tone="critical" padding={2} radius={2}>
            🚨 BREAKING NEWS
          </Badge>
        )}
        
        {scheduledPublish && status === 'approved' && (
          <Badge tone="primary" padding={2} radius={2}>
            📅 Scheduled: {new Date(scheduledPublish).toLocaleDateString()}
          </Badge>
        )}
      </Flex>
      
      {props.renderDefault(props)}
    </Flex>
  );
}
