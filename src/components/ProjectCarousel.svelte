<script lang="ts">
  import {
    type EmblaCarouselType,
    type EmblaOptionsType,
  } from "embla-carousel";
  import emblaCarouselSvelte from "embla-carousel-svelte";

  export let projects: Array<{
    name: string;
    description: string;
    slug: string;
  }>;

  let emblaApi: EmblaCarouselType;
  const options: EmblaOptionsType = { loop: false, duration: 10 };
  const onInit = (event: CustomEvent<EmblaCarouselType>) => {
    emblaApi = event.detail;
  };
  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") emblaApi.scrollPrev();
    if (event.key === "ArrowRight") emblaApi.scrollNext();
  };
</script>

<div
  class="hover:cursor-grab active:cursor-grabbing"
  use:emblaCarouselSvelte={{ options, plugins: [] }}
  on:emblaInit={onInit}
>
  <div class="mx-10 flex gap-4">
    {#each projects as project}
      <a
        href={"/projects/" + project.slug}
        class="scale-custom min-w-0 flex-[0_0_100%] rounded border p-3 hover:bg-gray-100 active:bg-gray-200"
      >
        <h2 class="text-lg">{project.name}</h2>
        <hr class="mb-2 border-gray-300" />
        <p class="text-sm">{project.description}</p>
      </a>
    {/each}
  </div>
</div>

<svelte:window on:keydown|preventDefault={onKeydown} />
