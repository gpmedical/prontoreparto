import { useState, type ComponentProps } from "react";
import type { LayoutChangeEvent, StyleProp, TextStyle } from "react-native";

import { Text } from "@/tw";

type AutoShrinkingTextProps = Omit<
  ComponentProps<typeof Text>,
  "onLayout" | "style"
> & {
  initialFontSize?: number;
  maxFontSize: number;
  maxLines: number;
  minFontSize: number;
  lineHeightMultiplier?: number;
  onLayout?: (event: LayoutChangeEvent) => void;
  style?: StyleProp<TextStyle>;
};

const layoutHeightTolerance = 1;

export function AutoShrinkingText({
  lineHeightMultiplier = 1.4,
  maxFontSize,
  initialFontSize = maxFontSize,
  maxLines,
  minFontSize,
  onLayout,
  style,
  ...textProps
}: AutoShrinkingTextProps) {
  const boundedInitialFontSize = Math.min(
    maxFontSize,
    Math.max(minFontSize, initialFontSize),
  );
  const [fontSize, setFontSize] = useState(boundedInitialFontSize);
  const [isFitted, setIsFitted] = useState(false);
  const lineHeight = Math.round(fontSize * lineHeightMultiplier);

  function handleLayout(event: LayoutChangeEvent) {
    onLayout?.(event);

    const renderedHeight = event.nativeEvent.layout.height;
    const maximumHeight = lineHeight * maxLines + layoutHeightTolerance;

    if (renderedHeight <= maximumHeight || fontSize <= minFontSize) {
      setIsFitted(true);
      return;
    }

    setFontSize((currentFontSize) =>
      Math.max(minFontSize, currentFontSize - 1),
    );
  }

  return (
    <Text
      {...textProps}
      onLayout={handleLayout}
      style={[style, { fontSize, lineHeight, opacity: isFitted ? 1 : 0 }]}
    />
  );
}
