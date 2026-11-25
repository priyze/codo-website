# Pixel Pal

I’m participating in a hackathon which is 5 days long along with one other teammate.

We’ve decided on a tamagotchi helper pet as our topic. It’s a robot that connects to your codeforces and github accounts and it uses the number of problems you solve today/ pushes you committed today as a scoring metric for its health/mood. It’s face should be animated and able to perform facial expressions on the screen, and produce chirps and do a celebration animation after performing an action. I’d also like it to have an idle animation and sound. I also want to add a touch sensitive bar so the user can pet it. The problems you solve are weighted by difficulty, which means harder problems get you a higher score, and only distinct problems are allowed.

The score should be displayed through 2 parameters: Health (long term, meant to indicate consistency) and mood (based on the number of solves that day). Maintaining the robot’s mood adds to the health score (0-100), based on how happy the robot was that day. The robot should show how healthy it is using facial indicators like droopy eyes for low health, and bright/open eyes for max health. The mood is indicated by how much it is smiling, and it has four states: ecstatic, happy, neutral, and sad. 

I also want a levels mechanich which increases based on the increase in difficulty of problems that you solve, relative to when you started. Being consistent with solving and pushes

Now, i want to create a website for this. The website should be sleek and modern, and should follow the attached colour palette. The first thing i want is an iphone-unboxing type "hello". Then, it should ask you to enter your name, your desk buddy's name, and ask and attach your codeforces and github handles. after that, i want there to be a few basic accessories to choose from (not more than 4) for your desk buddy right off the bat. the primary purpose of the website is JUST to be a shopping website, to buy accessories for your desk buddy. there should be a profile section at the top right. the accessories should be unlockable as you increase in levels. there should be a currency "codocoins". every codeforces problem sub 1100 should give you 10 codocoins, sub 1500 should give you 20 codocoins and above that, you should get 30 codocoins. each github push should be 15 codocoins. normalise these values, and decide on prices. the level cap for the desk buddy should be 50. the profile section at the top right should include provisions for changing your name, desk buddy's name and your usernames. it should include your codeforces rating graph, problems heatmap, categories of problems solved and their frequencies, highest contest ranking, max contest rating + current contest rating. it should contain your github heatmap, most popular repo, and your github profile picture and about me.

the accessories should only revolve around the eyes and mouth. some examples are different types of shades (like the pixel shades, maybe retro shades, different types of glasses), blushes (round blush, mole on cheek, anime blush), mustaches, eyelashes, etc. please keep in mind that the display is going to be on a 0.96" oled screen, and the whole thing is going to be coded on an esp32. please make sure that, whatever accessories you create, render accurately.

i have attached my esp32 sketch.ino and my face.h

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5442e412-ebfd-4cfb-9d25-ef74fe006a0b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
