'use client';

import React from 'react';
import { StringInputProps } from 'sanity';
import { Badge, Card, Flex, Stack, Text, Box } from '@sanity/ui';
import { ROLES } from '../../config/roles';

export default function RoleSelector(props: StringInputProps) {
  const { value, onChange } = props;
  const selectedRole = (value as string) || 'author';
  const roleConfig = ROLES[selectedRole as keyof typeof ROLES];
  
  return (
    <Stack space={3}>
      {/* Render default input */}
      {props.renderDefault(props)}
      
      {/* Show role info card */}
      {roleConfig && (
        <Card tone="primary" padding={3} radius={2} border>
          <Stack space={3}>
            <Flex align="center" gap={2}>
              <Badge tone="primary">{roleConfig.name}</Badge>
              <Text size={1} muted>
                {roleConfig.description}
              </Text>
            </Flex>
            
            <Box>
              <Text size={1} weight="medium">Permissions:</Text>
              <Flex wrap="wrap" gap={1} marginTop={2}>
                {roleConfig.permissions.slice(0, 5).map((perm) => (
                  <Badge key={perm} mode="outline" tone="default" fontSize={1}>
                    {perm}
                  </Badge>
                ))}
                {roleConfig.permissions.length > 5 && (
                  <Badge mode="outline" tone="default" fontSize={1}>
                    +{roleConfig.permissions.length - 5} more
                  </Badge>
                )}
              </Flex>
            </Box>
            
            {roleConfig.restrictions && (
              <Box>
                <Text size={1} weight="medium">Capabilities:</Text>
                <Stack space={1} marginTop={2}>
                  {roleConfig.restrictions.canPublish && (
                    <Text size={1} muted>✅ Can publish articles</Text>
                  )}
                  {roleConfig.restrictions.canSchedule && (
                    <Text size={1} muted>✅ Can schedule posts</Text>
                  )}
                  {roleConfig.restrictions.canSetBreakingNews && (
                    <Text size={1} muted>✅ Can set breaking news</Text>
                  )}
                  {roleConfig.restrictions.canCreateUsers && (
                    <Text size={1} muted>✅ Can manage users</Text>
                  )}
                  {roleConfig.restrictions.canManageSettings && (
                    <Text size={1} muted>✅ Can manage settings</Text>
                  )}
                </Stack>
              </Box>
            )}
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
