"""Seed data for Atlanta coffee shops."""

from sqlalchemy import select

from database import AsyncSessionLocal
from models import CoffeeShop

SHOPS = [
    CoffeeShop(
        name="Dancing Goats Coffee Bar",
        address="650 North Ave NE, Atlanta, GA 30308",
        lat=33.7745,
        lng=-84.3692,
        description="Beloved local roaster with a cozy Midtown location. Known for expertly roasted beans and a relaxed atmosphere.",
        website="https://www.batdorfandbronson.com",
    ),
    CoffeeShop(
        name="Condesa Coffee",
        address="480 John Wesley Dobbs Ave NE, Atlanta, GA 30312",
        lat=33.7580,
        lng=-84.3695,
        description="Industrial-chic spot in Old Fourth Ward serving single-origin pour-overs and house-made pastries.",
        website="https://www.condesacoffee.com",
    ),
    CoffeeShop(
        name="Spiller Park Coffee",
        address="Ponce City Market, 675 Ponce de Leon Ave NE, Atlanta, GA 30308",
        lat=33.7730,
        lng=-84.3655,
        description="Hip coffee counter inside Ponce City Market. Great for a quick espresso before exploring the food hall.",
        website="https://www.spillerpark.com",
    ),
    CoffeeShop(
        name="Rev Coffee Roasters",
        address="1680 Stewart Ave, Atlanta, GA 30316",
        lat=33.7210,
        lng=-84.3380,
        description="South Atlanta roastery and cafe with a focus on community. Excellent cold brew and seasonal drinks.",
        website="https://www.revcoffee.com",
    ),
    CoffeeShop(
        name="Chrome Yellow Trading Co",
        address="501 Flat Shoals Ave SE, Atlanta, GA 30316",
        lat=33.7395,
        lng=-84.3410,
        description="East Atlanta Village favorite with vintage vibes. Serves Counter Culture coffee and fresh baked goods.",
        website="https://www.chromeyellowtrading.com",
    ),
    CoffeeShop(
        name="Aurora Coffee",
        address="992 N Highland Ave NE, Atlanta, GA 30306",
        lat=33.7810,
        lng=-84.3520,
        description="Virginia Highlands staple since 1992. Cozy neighborhood spot with strong espresso and friendly baristas.",
        website="https://www.auroracoffee.com",
    ),
    CoffeeShop(
        name="Brash Coffee",
        address="710 Peachtree St NE, Atlanta, GA 30308",
        lat=33.7725,
        lng=-84.3850,
        description="Minimalist Midtown cafe with precision brewing. Perfect for coffee purists.",
        website="https://www.brashcoffee.com",
    ),
    CoffeeShop(
        name="Taproom Coffee",
        address="198 12th St NE, Atlanta, GA 30309",
        lat=33.7815,
        lng=-84.3835,
        description="Coffee by day, craft beer by night. Great workspace with plenty of outlets.",
        website="https://www.taproomcoffee.com",
    ),
    CoffeeShop(
        name="Inman Perk Coffee",
        address="240 N Highland Ave NE, Atlanta, GA 30307",
        lat=33.7635,
        lng=-84.3525,
        description="Inman Park neighborhood cafe with outdoor seating. Known for smooth lattes and breakfast sandwiches.",
        website="https://www.inmanperk.com",
    ),
    CoffeeShop(
        name="The Daily",
        address="3080 Peachtree Rd NW, Atlanta, GA 30305",
        lat=33.8420,
        lng=-84.3680,
        description="Buckhead location of the popular Atlanta chain. Bright space with excellent pastries and pour-overs.",
        website="https://www.thedailyatl.com",
    ),
    CoffeeShop(
        name="Harbor Coffee",
        address="299 North Highland Ave NE, Atlanta, GA 30307",
        lat=33.7640,
        lng=-84.3510,
        description="Inman Park newcomer with a focus on quality and community. Former pop-up turned permanent brick-and-mortar.",
        website=None,
    ),
    CoffeeShop(
        name="The Reading Room",
        address="205 W Ponce de Leon Ave, Decatur, GA 30030",
        lat=33.7755,
        lng=-84.2965,
        description="Decatur's literary cafe. Books, coffee, and a calm atmosphere perfect for reading.",
        website="https://www.thereadingroomdecatur.com",
    ),
    CoffeeShop(
        name="Chattahoochee Coffee Company",
        address="6950 Shannon Pkwy, Union City, GA 30291",
        lat=33.5820,
        lng=-84.5420,
        description="South metro roaster with a spacious cafe. Great for meetings and remote work.",
        website="https://www.chattahoocheecoffee.com",
    ),
    CoffeeShop(
        name="San Francisco Coffee Roasting Company",
        address="1192 N Highland Ave NE, Atlanta, GA 30306",
        lat=33.7840,
        lng=-84.3515,
        description="Virginia Highlands institution since 1993. Roasts beans on-site for maximum freshness.",
        website="https://www.sanfranciscoffee.com",
    ),
    CoffeeShop(
        name="Cafe Jonah and the Magical Attic",
        address="1551 S Piedmont Ave, Atlanta, GA 30324",
        lat=33.7950,
        lng=-84.3710,
        description="Whimsical cafe with a pay-what-you-can model. Cozy attic seating and community-focused mission.",
        website="https://www.cafejonah.org",
    ),
    CoffeeShop(
        name="East Pole Coffee Co",
        address="351 Peachtree Hills Ave NE, Atlanta, GA 30305",
        lat=33.8380,
        lng=-84.3685,
        description="Buckhead roastery and cafe. Single-origin offerings and a sleek, modern space.",
        website="https://www.eastpolecoffee.com",
    ),
    CoffeeShop(
        name="Sublime Doughnuts & Coffee",
        address="535 10th St NW, Atlanta, GA 30318",
        lat=33.7785,
        lng=-84.4040,
        description="Famous for creative doughnuts, but the coffee holds its own. West Midtown gem.",
        website="https://www.sublimedoughnuts.com",
    ),
    CoffeeShop(
        name="Land of a Thousand Hills Coffee",
        address="1000 Marietta St NW, Atlanta, GA 30318",
        lat=33.7770,
        lng=-84.4120,
        description="Mission-driven roaster with a focus on Rwandan beans. Great cause and great coffee.",
        website="https://www.drinkgood.coffee",
    ),
]


async def seed_db() -> None:
    """Seed coffee shops if the table is empty. Call after init_db."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(CoffeeShop).limit(1))
        if result.scalar_one_or_none() is not None:
            return  # Already seeded

        session.add_all(SHOPS)
        await session.commit()
