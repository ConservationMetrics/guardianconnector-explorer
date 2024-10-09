import { ref, type Ref } from "vue";

interface Tag {
  text: string;
}

export function updateTags(initialTags: Record<string, Tag[]>): {
  tags: Ref<Record<string, Tag[]>>;
  updateTags: (key: string, newTags: Tag[]) => string;
} {
  const tags = ref(initialTags);

  const updateTags = (key: string, newTags: Tag[]): string => {
    tags.value[key] = newTags;
    return newTags.map((tag) => tag.text).join(",");
  };

  return {
    tags,
    updateTags,
  };
}
