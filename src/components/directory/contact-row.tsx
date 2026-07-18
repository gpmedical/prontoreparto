import { Link } from "expo-router";

import { CONTACT_PRESENTATION } from "@/components/directory/contact-presentation";
import { AppSymbol } from "@/components/ui/app-symbol";
import type { DirectoryContact } from "@/features/directory";
import { Pressable, Text, View } from "@/tw";

type ContactRowProps = {
  contact: DirectoryContact;
  detailTab?: "home" | "preferiti";
  hospitalName?: string;
  isFavorite?: boolean;
};

export function ContactRow({
  contact,
  detailTab = "home",
  hospitalName,
  isFavorite = false,
}: ContactRowProps) {
  const presentation = CONTACT_PRESENTATION[contact.type];
  const valueLabel = contact.value;
  const detailPath =
    detailTab === "preferiti"
      ? "/preferiti/contatto/[id]"
      : "/home/contatto/[id]";

  return (
    <Link
      href={{ pathname: detailPath, params: { id: contact.id } }}
      asChild
    >
      <Pressable
        accessibilityLabel={`${contact.name}, ${presentation.label}, ${valueLabel}`}
        accessibilityRole="link"
        className="min-h-[78px] flex-row items-center gap-3 bg-white px-4 py-3 active:bg-pronto-teal-soft"
      >
        <View
          className="w-1 self-stretch rounded-full"
          style={{ backgroundColor: presentation.color }}
        />

        <View className="min-w-0 flex-1 gap-1.5">
          <View className="flex-row items-start justify-between gap-2">
            <Text
              selectable
              className="min-w-0 flex-1 text-base font-bold leading-5 text-pronto-ink"
            >
              {contact.name}
            </Text>
            {isFavorite ? (
              <AppSymbol name="favorite" size={16} tintColor="#d97706" />
            ) : null}
          </View>

          <View className="flex-row flex-wrap items-center gap-2">
            <View
              className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{ backgroundColor: presentation.softColor }}
            >
              <AppSymbol name={presentation.icon} size={15} tintColor={presentation.color} />
              <Text
                selectable
                className="text-sm font-bold"
                style={{ color: presentation.color }}
              >
                {presentation.label}
              </Text>
            </View>
            <Text
              selectable
              className="min-w-0 flex-1 text-base text-pronto-secondary"
              numberOfLines={1}
            >
              {valueLabel}
            </Text>
          </View>

          {hospitalName ? (
            <Text selectable className="text-xs text-pronto-placeholder" numberOfLines={1}>
              {hospitalName}
            </Text>
          ) : null}
        </View>

        <AppSymbol name="chevronRight" size={15} tintColor="#789095" />
      </Pressable>
    </Link>
  );
}
