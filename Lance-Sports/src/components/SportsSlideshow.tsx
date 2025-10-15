import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface SportEvent {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  date: string;
  link: string;
}

const sportsEvents: SportEvent[] = [
  {
    id: 1,
    title: "Premier League Championship Final",
    description: "Experience the ultimate football showdown as top teams battle for the championship title at the iconic Wembley Stadium.",
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaWVyJTIwbGVhZ3VlJTIwc3RhZGl1bSUyMGZvb3RiYWxsfGVufDF8fHx8MTc1NTY4MTIyN3ww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Premier League",
    date: "Sun, 25 Aug 15:00",
    link: "#premier-league-final"
  },
  {
    id: 2,
    title: "FIFA World Cup 2026",
    description: "The world's greatest football tournament returns with unprecedented excitement and global unity.",
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaWZhJTIwd29ybGQlMjBjdXAlMjBmb290YmFsbCUyMGNlbGVicmF0aW9ufGVufDF8fHx8MTc1NTY4MTIyN3ww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "World Cup",
    date: "Sat, 24 Aug 14:30",
    link: "#world-cup-2026"
  },
  {
    id: 3,
    title: "Manchester Derby",
    description: "The most intense rivalry in English football as Manchester City and Manchester United clash for supremacy.",
    image: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW5jaGVzdGVyJTIwZGVyYnk%3D&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Premier League",
    date: "Mon, 26 Aug 10:00",
    link: "#manchester-derby"
  },
  {
    id: 4,
    title: "Champions League Final",
    description: "The pinnacle of European club football where legends are made and dreams come true.",
    image: "https://images2.minutemediacdn.com/image/upload/c_crop,w_4532,h_2549,x_0,y_91/c_fill,w_1080,ar_16:9,f_auto,q_auto,g_auto/images%2FGettyImages%2Fmmsport%2F90min_en_international_web%2F01hdrsnnakg7hdfkqrqp.jpg",
    category: "Champions League",
    date: "Tue, 27 Aug 19:45",
    link: "#champions-league-final"
  },
  {
    id: 5,
    title: "North London Derby",
    description: "Arsenal vs Tottenham - one of football's fiercest rivalries in the heart of London.",
    image: "https://static.independent.co.uk/2023/09/22/13/c7da3eaa8c75efe44fb95d16859cffcfY29udGVudHNlYXJjaGFwaSwxNjk1NDcwNTM3-2.70581969.jpg",
    category: "Premier League",
    date: "Wed, 28 Aug 17:30",
    link: "#north-london-derby"
  },
  {
    id: 6,
    title: "World Cup Final 2022",
    description: "Relive the magic of Qatar 2022 where Argentina lifted the trophy in dramatic fashion.",
    image: "https://dims.apnews.com/dims4/default/2c9290c/2147483647/strip/true/crop/2857x1905+0+0/resize/599x399!/quality/90/?url=https%3A%2F%2Fstorage.googleapis.com%2Fafs-prod%2Fmedia%2F3952413afee74fd48ecba8ba26733f66%2F2857.jpeg",
    category: "World Cup",
    date: "Thu, 29 Aug 20:00",
    link: "#world-cup-2022"
  }
];

export function SportsSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sportsEvents.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sportsEvents.length) % sportsEvents.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleEventClick = (link: string) => {
    // In a real app, this would navigate to the event page
    console.log(`Navigating to ${link}`);
    alert(`Redirecting to ${sportsEvents[currentSlide].title}`);
  };

  return (
    <div className="relative w-full h-96 md:h-[500px] overflow-hidden rounded-xl glass-card dark:glass-card-dark shadow-2xl">
      {/* Main Image */}
      <div className="relative h-full">
        <ImageWithFallback
          src={sportsEvents[currentSlide].image}
          alt={sportsEvents[currentSlide].title}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => handleEventClick(sportsEvents[currentSlide].link)}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent backdrop-blur-sm" />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-2xl">
            <div className="inline-block px-4 py-2 glass-green dark:glass-green-dark rounded-full text-sm mb-3 glass-glow">
              {sportsEvents[currentSlide].category}
            </div>
            <h2 className="text-2xl md:text-3xl mb-2">
              {sportsEvents[currentSlide].title}
            </h2>
            <p className="text-gray-200 text-sm md:text-base mb-3">
              {sportsEvents[currentSlide].description}
            </p>
            <div className="text-sm text-gray-300 mb-4">
              {sportsEvents[currentSlide].date}
            </div>
            <Button 
              onClick={() => handleEventClick(sportsEvents[currentSlide].link)}
              className="glass-green dark:glass-green-dark text-white hover:bg-green-600/80 dark:hover:bg-green-700/80 transition-all duration-200 glass-glow"
            >
              View Event Details
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 glass dark:glass-dark text-white hover:bg-white/20 transition-all duration-200"
        onClick={prevSlide}
      >
        <ChevronLeft size={24} />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 glass dark:glass-dark text-white hover:bg-white/20 transition-all duration-200"
        onClick={nextSlide}
      >
        <ChevronRight size={24} />
      </Button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 right-6 flex space-x-2">
        {sportsEvents.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentSlide ? 'bg-white' : 'bg-white/40 hover:bg-white/60'
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}