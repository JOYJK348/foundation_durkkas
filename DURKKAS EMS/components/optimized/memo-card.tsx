"use client";

import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface MemoCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
}

export const MemoCard = memo(function MemoCard({
  title,
  description,
  icon,
  className,
}: MemoCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        {icon}
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
});

