import React from 'react'
import Card from './Card'
import LinkCard from './LinkCard'

function Home() {
    return (
        <div>
            <LinkCard content="About" link="/about" />
            <LinkCard content="Select" link="/select" />
            <Card content="Card" />
            <Card content="Card" />
            <Card content="Card" />
            <Card content="Card" />
        </div>
    )
}

export default Home