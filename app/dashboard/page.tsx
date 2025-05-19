import { Suspense } from "react"
import { getEvents } from "../actions/events"
import { getAllDjProfiles } from "../actions/dj-profiles"
import { getLiveStreams } from "../actions/live-streams"
import { DashboardTabs } from "./dashboard-tabs"
import { DashboardHeader } from "./dashboard-header"
import DashboardLoading from "./loading"

export default async function DashboardPage() {
  // Fetch data for all tabs
  const eventsPromise = getEvents("upcoming")
  const djProfilesPromise = getAllDjProfiles()
  const liveStreamsPromise = getLiveStreams(true)

  // Wait for all data to load
  const [events, djProfiles, liveStreams] = await Promise.all([eventsPromise, djProfilesPromise, liveStreamsPromise])

  return (
    <div className="container mx-auto py-10 px-4">
      <DashboardHeader />
      <Suspense fallback={<DashboardLoading />}>
        <DashboardTabs events={events} djProfiles={djProfiles} liveStreams={liveStreams} />
      </Suspense>
    </div>
  )
}
