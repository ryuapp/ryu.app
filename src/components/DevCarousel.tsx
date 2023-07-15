import useEmblaCarousel from "embla-carousel-react"

const devList = [
  { name: "Fluent Emoji Picker", description: "Web app to easily copy Fluent Emoji.", slug: "fluent-emoji" },
  { name: "Lslike", description: "Ls command for Windows with Deno.", slug: "lslike" },
]

export const DevCarousel = () => {
  const [emblaRef] = useEmblaCarousel()

  return (
    <div className="embla hover:cursor-grab active:cursor-grabbing" ref={emblaRef}>
      <div className="embla__container gap-4">
        {devList.map((dev, index) => (
          <a
            key={index}
            href={"/dev/" + dev.slug}
            className="embla__slide scale-custom rounded border p-4 hover:bg-gray-100 active:bg-gray-200"
          >
            <h2 className="text-xl">{dev.name}</h2>
            <hr className="mb-2 border-gray-300" />
            <p>{dev.description}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
