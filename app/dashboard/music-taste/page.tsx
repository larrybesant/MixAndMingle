"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

export default function MusicTastePage() {
  const { toast } = useToast()
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedArtists, setSelectedArtists] = useState<string[]>([])

  const genres = [
    "House",
    "Techno",
    "Deep House",
    "Trance",
    "Drum & Bass",
    "Dubstep",
    "Ambient",
    "Lo-Fi",
    "Hip Hop",
    "R&B",
    "Pop",
    "Rock",
    "Jazz",
    "Classical",
    "Reggae",
    "Latin",
  ]

  const artists = [
    "Daft Punk",
    "Disclosure",
    "Bonobo",
    "Peggy Gou",
    "Bicep",
    "Four Tet",
    "Kaytranada",
    "Jamie xx",
    "Floating Points",
    "Caribou",
    "The Chemical Brothers",
    "Aphex Twin",
    "Moby",
    "Fatboy Slim",
    "Massive Attack",
    "Underworld",
    "Burial",
    "Jon Hopkins",
  ]

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre))
    } else {
      setSelectedGenres([...selectedGenres, genre])
    }
  }

  const toggleArtist = (artist: string) => {
    if (selectedArtists.includes(artist)) {
      setSelectedArtists(selectedArtists.filter((a) => a !== artist))
    } else {
      setSelectedArtists([...selectedArtists, artist])
    }
  }

  const handleSave = () => {
    // In a real app, this would save to the database
    toast({
      title: "Music preferences saved",
      description: "Your music taste has been updated successfully.",
    })
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">Music Taste</h2>
        <p className="text-gray-400">Set your music preferences to get better matches and recommendations</p>
      </div>

      <Tabs defaultValue="genres" className="w-full">
        <TabsList className="bg-gray-900 border-gray-800">
          <TabsTrigger value="genres" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Genres
          </TabsTrigger>
          <TabsTrigger value="artists" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Artists
          </TabsTrigger>
          <TabsTrigger value="preferences" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="genres" className="mt-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Select Your Favorite Genres</CardTitle>
              <CardDescription className="text-gray-400">Choose the music genres you enjoy the most</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <Badge
                    key={genre}
                    variant={selectedGenres.includes(genre) ? "default" : "outline"}
                    className={`cursor-pointer ${
                      selectedGenres.includes(genre)
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "border-gray-700 text-gray-400 hover:border-gray-600"
                    }`}
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="artists" className="mt-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Select Your Favorite Artists</CardTitle>
              <CardDescription className="text-gray-400">Choose the artists you listen to the most</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {artists.map((artist) => (
                  <Badge
                    key={artist}
                    variant={selectedArtists.includes(artist) ? "default" : "outline"}
                    className={`cursor-pointer ${
                      selectedArtists.includes(artist)
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "border-gray-700 text-gray-400 hover:border-gray-600"
                    }`}
                    onClick={() => toggleArtist(artist)}
                  >
                    {artist}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Music Preferences</CardTitle>
              <CardDescription className="text-gray-400">Set your preferences for music discovery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-white">Mainstream vs. Underground</label>
                  <span className="text-xs text-gray-400">Balanced</span>
                </div>
                <Slider defaultValue={[50]} max={100} step={1} />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Mainstream</span>
                  <span>Underground</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-white">Familiar vs. Discover New</label>
                  <span className="text-xs text-gray-400">More Discovery</span>
                </div>
                <Slider defaultValue={[70]} max={100} step={1} />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Familiar</span>
                  <span>Discover New</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-white">Chill vs. Energetic</label>
                  <span className="text-xs text-gray-400">Balanced</span>
                </div>
                <Slider defaultValue={[50]} max={100} step={1} />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Chill</span>
                  <span>Energetic</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
          Save All Preferences
        </Button>
      </div>
    </div>
  )
}
