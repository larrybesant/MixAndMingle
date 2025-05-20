"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { TagCloudItem } from "@/lib/feedback-analytics-service"
import * as d3 from "d3"
import cloud from "d3-cloud"

interface TagCloudProps {
  data: TagCloudItem[]
  isLoading?: boolean
}

export function TagCloud({ data, isLoading = false }: TagCloudProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (isLoading || !data.length || !svgRef.current) return

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove()

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    // Find min and max values for scaling
    const minValue = Math.min(...data.map((d) => d.value))
    const maxValue = Math.max(...data.map((d) => d.value))

    // Scale for font size
    const fontSizeScale = d3.scaleLinear().domain([minValue, maxValue]).range([14, 60])

    // Color scale
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)

    // Create layout
    const layout = cloud()
      .size([width, height])
      .words(
        data.map((d) => ({
          text: d.text,
          size: fontSizeScale(d.value),
          value: d.value,
        })),
      )
      .padding(5)
      .rotate(() => 0)
      .fontSize((d) => (d as any).size)
      .on("end", draw)

    layout.start()

    function draw(words: any[]) {
      const svg = d3
        .select(svgRef.current)
        .attr("width", layout.size()[0])
        .attr("height", layout.size()[1])
        .append("g")
        .attr("transform", `translate(${layout.size()[0] / 2},${layout.size()[1] / 2})`)

      svg
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .style("font-size", (d) => `${d.size}px`)
        .style("fill", (d, i) => colorScale(i.toString()))
        .attr("text-anchor", "middle")
        .attr("transform", (d) => `translate(${d.x},${d.y})`)
        .text((d) => d.text)
        .append("title")
        .text((d) => `${d.text}: ${(d as any).value}`)
    }
  }, [data, isLoading])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Common Feedback Themes</CardTitle>
          <CardDescription>Loading tag data...</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Common Feedback Themes</CardTitle>
        <CardDescription>Frequently mentioned topics in feedback</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        {data.length > 0 ? (
          <svg ref={svgRef} width="100%" height="100%"></svg>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">No tag data available</div>
        )}
      </CardContent>
    </Card>
  )
}
