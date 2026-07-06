import { Link as RouterLink } from "expo-router";
import React from "react";
import {
  KeyboardAvoidingView as RNKeyboardAvoidingView,
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  Text as RNText,
  TextInput as RNTextInput,
  View as RNView,
} from "react-native";
import { useCssElement } from "react-native-css";

type CssComponent = React.ComponentType<Record<string, unknown>>;
type CssElement = (
  component: CssComponent,
  incomingProps: Record<string, unknown>,
  mapping: Record<string, string>,
) => React.ReactElement | null;

const cssElement = useCssElement as unknown as CssElement;
const cssProps = (props: unknown) => props as Record<string, unknown>;

export function useCSSVariable(variable: string) {
  return `var(${variable})`;
}

export const Link = (
  props: React.ComponentProps<typeof RouterLink> & { className?: string },
) =>
  cssElement(RouterLink as unknown as CssComponent, cssProps(props), {
    className: "style",
  });

Link.Trigger = RouterLink.Trigger;
Link.Menu = RouterLink.Menu;
Link.MenuAction = RouterLink.MenuAction;
Link.Preview = RouterLink.Preview;

export const KeyboardAvoidingView = (
  props: React.ComponentProps<typeof RNKeyboardAvoidingView> & { className?: string },
) =>
  cssElement(RNKeyboardAvoidingView as unknown as CssComponent, cssProps(props), {
    className: "style",
  });
KeyboardAvoidingView.displayName = "CSS(KeyboardAvoidingView)";

export const Pressable = (
  props: React.ComponentProps<typeof RNPressable> & { className?: string },
) => cssElement(RNPressable as unknown as CssComponent, cssProps(props), { className: "style" });
Pressable.displayName = "CSS(Pressable)";

export const ScrollView = (
  props: React.ComponentProps<typeof RNScrollView> & {
    className?: string;
    contentContainerClassName?: string;
  },
) =>
  cssElement(RNScrollView as unknown as CssComponent, cssProps(props), {
    className: "style",
    contentContainerClassName: "contentContainerStyle",
  });
ScrollView.displayName = "CSS(ScrollView)";

export const Text = (
  props: React.ComponentProps<typeof RNText> & { className?: string },
) => cssElement(RNText as unknown as CssComponent, cssProps(props), { className: "style" });
Text.displayName = "CSS(Text)";

export const TextInput = (
  props: React.ComponentProps<typeof RNTextInput> & { className?: string },
) => cssElement(RNTextInput as unknown as CssComponent, cssProps(props), { className: "style" });
TextInput.displayName = "CSS(TextInput)";

export const View = (
  props: React.ComponentProps<typeof RNView> & { className?: string },
) => cssElement(RNView as unknown as CssComponent, cssProps(props), { className: "style" });
View.displayName = "CSS(View)";
