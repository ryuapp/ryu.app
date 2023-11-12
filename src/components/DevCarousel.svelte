<script lang="ts">
  import emblaCarouselSvelte, { type EmblaCarouselType, type EmblaOptionsType } from "embla-carousel-svelte"

  let emblaApi: { scrollPrev: () => void; scrollNext: () => void }
  const options: EmblaOptionsType = { loop: false, duration: 10 }
  const devList = [
    { name: "Fluent Emoji Picker", description: "Web app to easily copy Fluent Emoji.", slug: "fluent-emoji" },
    { name: "Lslike", description: "Ls command for Windows with Deno.", slug: "lslike" },
  ]
  const onInit = (event: { detail: EmblaCarouselType }) => {
    emblaApi = event.detail
  }
  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") emblaApi.scrollPrev()
    if (event.key === "ArrowRight") emblaApi.scrollNext()
  }
</script>

<div
  class="hover:cursor-grab active:cursor-grabbing"
  use:emblaCarouselSvelte={{ options, plugins: [] }}
  on:emblaInit={onInit}
>
  <div class="mx-10 flex max-w-xs gap-4">
    {#each devList as dev}
      <a
        href={"/dev/" + dev.slug}
        class="scale-custom min-w-0 flex-[0_0_100%] rounded border p-4 hover:bg-gray-100 active:bg-gray-200"
      >
        <h2 class="text-xl">{dev.name}</h2>
        <hr class="mb-2 border-gray-300" />
        <p>{dev.description}</p>
      </a>
    {/each}
  </div>
</div>

<svelte:window on:keydown={onKeydown} />
