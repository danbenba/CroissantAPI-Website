interface PageIndicatorProps {
  title: string
  className?: string
}

export default function PageIndicator({ title, className = "" }: PageIndicatorProps) {
  return (
    <div
      className={`bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white px-8 py-4 rounded-full text-center w-fit mx-auto my-8 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 animate-fade-in-up ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        {title}
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
      </div>
    </div>
  )
}
