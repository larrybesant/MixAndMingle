import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // In a real app, this would fetch from your database
    // For now, we'll return mock data based on the ID
    const drinks = [
      {
        id: "1",
        name: "Classic Mojito",
        description: "Refreshing mint and lime cocktail with rum and soda water",
        category: "cocktail",
        alcoholic: true,
        ingredients: ["White rum", "Sugar", "Lime juice", "Soda water", "Mint"],
        instructions: "Muddle mint leaves with sugar and lime juice. Add rum and ice, top with soda water.",
        image: "/drinks/mojito.png",
        popular: true,
      },
      {
        id: "2",
        name: "Virgin Piña Colada",
        description: "Tropical pineapple and coconut non-alcoholic beverage",
        category: "mocktail",
        alcoholic: false,
        ingredients: ["Pineapple juice", "Coconut cream", "Ice"],
        instructions: "Blend pineapple juice, coconut cream, and ice until smooth.",
        image: "/drinks/pina-colada.png",
        popular: true,
      },
      {
        id: "3",
        name: "Old Fashioned",
        description: "Classic whiskey cocktail with bitters and sugar",
        category: "cocktail",
        alcoholic: true,
        ingredients: ["Bourbon", "Angostura bitters", "Sugar cube", "Water"],
        instructions: "Muddle sugar with bitters and water. Add bourbon and ice, stir well.",
        image: "/drinks/old-fashioned.png",
        popular: true,
      },
      {
        id: "4",
        name: "Strawberry Lemonade",
        description: "Sweet and tangy strawberry-infused lemonade",
        category: "mocktail",
        alcoholic: false,
        ingredients: ["Lemon juice", "Sugar", "Strawberries", "Water", "Ice"],
        instructions: "Blend strawberries, mix with lemon juice, sugar, and water. Serve over ice.",
        image: "/drinks/strawberry-lemonade.png",
        popular: false,
      },
      {
        id: "5",
        name: "Margarita",
        description: "Tequila-based cocktail with lime and orange liqueur",
        category: "cocktail",
        alcoholic: true,
        ingredients: ["Tequila", "Triple sec", "Lime juice", "Salt"],
        instructions: "Shake tequila, triple sec, and lime juice with ice. Serve in a salt-rimmed glass.",
        image: "/drinks/margarita.png",
        popular: true,
      },
    ]

    const drink = drinks.find((d) => d.id === id)

    if (!drink) {
      return NextResponse.json({ error: "Drink not found" }, { status: 404 })
    }

    return NextResponse.json(drink)
  } catch (error) {
    console.error(`Error fetching drink ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to fetch drink" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const updates = await request.json()

    // In a real app, this would update your database
    // For now, we'll just return the updated drink
    const updatedDrink = {
      id,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(updatedDrink)
  } catch (error) {
    console.error(`Error updating drink ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update drink" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // In a real app, this would delete from your database
    // For now, we'll just return a success message
    return NextResponse.json({ success: true, message: `Drink ${id} deleted successfully` })
  } catch (error) {
    console.error(`Error deleting drink ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to delete drink" }, { status: 500 })
  }
}
