import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  Sun, 
  Moon, 
  Type 
} from "lucide-react";
import { useDarkMode } from "@/lib/use-dark-mode";

interface ReaderControlsProps {
  currentPage: number;
  totalPages: number;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  visible: boolean;
}

export default function ReaderControls({
  currentPage,
  totalPages,
  fontSize,
  onFontSizeChange,
  onPrevPage,
  onNextPage,
  visible
}: ReaderControlsProps) {
  const { isDark, toggleTheme } = useDarkMode();
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const handleFontSizeChange = (value: number[]) => {
    onFontSizeChange(value[0]);
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}`}>
      <div className="flex items-center space-x-4">
        <Tabs defaultValue="font" onValueChange={(value) => setActiveTab(value === activeTab ? null : value)}>
          <TabsList className="grid grid-cols-3 h-9 w-36">
            <TabsTrigger value="font" className="h-7">
              <Type className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="theme" className="h-7">
              {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </TabsTrigger>
            <TabsTrigger value="audio" className="h-7">
              <Volume2 className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
          
          {activeTab === "font" && (
            <TabsContent value="font" className="absolute bottom-16 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-t-lg p-4 w-80">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Font Size</h3>
                  <div className="flex items-center">
                    <span className="text-xs mr-2">A</span>
                    <Slider
                      value={[fontSize]}
                      min={12}
                      max={24}
                      step={1}
                      onValueChange={handleFontSizeChange}
                      className="flex-1"
                    />
                    <span className="text-base ml-2">A</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
          
          {activeTab === "theme" && (
            <TabsContent value="theme" className="absolute bottom-16 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-t-lg p-4 w-80">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Theme</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant={!isDark ? "default" : "outline"} 
                      onClick={() => !isDark || toggleTheme()}
                      className="justify-start"
                    >
                      <Sun className="h-4 w-4 mr-2" /> Light
                    </Button>
                    <Button 
                      variant={isDark ? "default" : "outline"} 
                      onClick={() => isDark || toggleTheme()}
                      className="justify-start"
                    >
                      <Moon className="h-4 w-4 mr-2" /> Dark
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
          
          {activeTab === "audio" && (
            <TabsContent value="audio" className="absolute bottom-16 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-t-lg p-4 w-80">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Text-to-Speech</h3>
                  <Button className="w-full">
                    Start Reading Aloud
                  </Button>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
      
      <div className="flex items-center">
        <span className="text-sm text-gray-600 dark:text-gray-400 mr-3">
          Page {currentPage} of {totalPages}
        </span>
        <div className="w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary-500 rounded-full" 
            style={{ width: `${(currentPage / totalPages) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={onPrevPage} disabled={currentPage <= 1}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onNextPage} disabled={currentPage >= totalPages}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
