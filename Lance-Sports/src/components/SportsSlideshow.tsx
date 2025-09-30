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
    title: "Manchester City lose away to Brighton",
    description: "Watch the highlights of Manchester City vs Brighton",
    image: "https://images.unsplash.com/photo-1612387050703-685c779375d4?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Football",
    date: "Sun, 25 Aug 15:00",
    link: "https://youtu.be/WBkCZ8MaAl8?si=Q2NqRO07_-bmBRXP"
  },
  {
    id: 2,
    title: "Watch the fiercest battles between the Springboks and All-Blacks before the game this weekend",
    description: "Witness the intensity and passion as rugby's finest compete for a spot in the world cup final.",
    image: "https://images.unsplash.com/photo-1574602904316-f84f62477265?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydWdieSUyMHdvcmxkJTIwY3VwJTIwY2VsZWJyYXRpb258ZW58MXx8fHwxNzU1NjgxMjI2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Rugby",
    date: "Sat, 24 Aug 14:30",
    link: "https://www.youtube.com/live/G19sNbJ3lF8?si=HpoS7M-HQzQZtg68"
  },
  {
    id: 3,
    title: "Cricket Championship Match",
    description: "Don't miss this thrilling cricket encounter between international powerhouses.",
    image: "https://images.unsplash.com/photo-1730739463889-34c7279277a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmlja2V0JTIwc3RhZGl1bSUyMG1hdGNofGVufDF8fHx8MTc1NTYxNTc0OXww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Cricket",
    date: "Mon, 26 Aug 10:00",
    link: "https://youtu.be/SExrNuWTK20?si=KQKb9EmYjZjpOkMr"
  },
  {
    id: 4,
    title: "Manchester United vs Arsenal",
    description: "A classic rivalry renewed as two historic clubs face off in this highly anticipated match.",
    image: "https://images.unsplash.com/photo-1616124619460-ff4ed8f4683c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaWVyJTIwbGVhZ3VlJTIwZm9vdGJhbGx8ZW58MXx8fHwxNzU1NjgxMjI3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Football",
    date: "Sun, 17 Aug 17:00",
    link: "https://youtu.be/GmwP-j2B8EU?si=xyVbw-9ec7hvQsn-"
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
    //alert(`Redirecting to ${sportsEvents[currentSlide].title}`);
    window.open(link, "_blank");

  };

  return (
    <div className="relative w-full h-96 md:h-[500px] overflow-hidden rounded-lg shadow-lg">
      {/* Main Image */}
      <div className="relative h-full">
        <ImageWithFallback
          src={sportsEvents[currentSlide].image}
          alt={sportsEvents[currentSlide].title}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => handleEventClick(sportsEvents[currentSlide].link)}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-2xl">
            <div className="inline-block px-3 py-1 bg-green-600 rounded-full text-sm mb-3">
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
              className="bg-green-600 hover:bg-green-700 text-white"
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
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
        onClick={prevSlide}
      >
        <ChevronLeft size={24} />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
        onClick={nextSlide}
      >
        <ChevronRight size={24} />
      </Button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 right-6 flex space-x-2">
        {sportsEvents.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors duration-200 ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}