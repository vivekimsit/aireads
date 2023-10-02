# a-multi-year-challenge-repairing-deep-linking-attribution-at-spotify

## 2023-10-02T14:16:15.525Z

## A Multi-Year Challenge: Repairing Deep Linking & Attribution at Spotify        

        
            
            
                February 21, 2023
                
                    Published by Erik Dornbush, Sr. Systems Engineer                
            
        
        
        
            
            
                                                
                                            
                        
        

        

        
Deep linking and attribution are important functionalities for a growing business. Deep links seamlessly get you to the content you want in the app. Attribution helps us understand which activity (such as marketing or sharing) drives you to that content. At Spotify in 2017, these critical functionalities were in disrepair. But over the course of five years, we’ve endured ups and downs and learned many valuable lessons that have strengthened our ability to identify, communicate about, and resolve the numerous opportunities in the marketing technology (martech) domain. 



Deep linking? Attribution?



Right. I glossed over these a bit. Let me clarify:



Deep linking is what happens when you click a link and you’re brought directly to the content you saw displayed. For instance, if your friend shares a Spotify link in WhatsApp, you’ll see a preview of the track/playlist/album title or artist name. Then you click on it and end up in the Spotify app, exactly where you can play that track/playlist/album, etc. A good deep linking user experience (UX) is fast, simple, and gets you where you want to go. A bad deep linking user experience leaves you wondering, “What just happened?” or “What did I just click on?”



Attribution helps us understand if and how your listening behavior is influenced by marketing and messaging activity. For instance, did you listen to Taylor Swift’s new album because your friend shared a link with you? Or was it because you clicked a link in a Spotify social media post? Or was it because of that push notification you received? Our teams can use the answers to these questions, and others like them, to plan their work more effectively and to ensure we alert our listeners to the content they care about most.



Spotify history: Deep linking & attribution



Pre-2017: The “darker” time



Before 2017, we had become aware of deep linking issues through complaints that trickled in from our users (sometimes on social media). And as our marketing teams began to leverage deep links more and more in campaigns to drive engagement with specific content, those complaints continued to increase. Addressing these complaints was a challenge due to difficulties in reproducing and troubleshooting the errors. 



At that time, attribution was also limited. Only a subset of paid marketing channels leveraged the existing attribution solution, making it nearly impossible to create a complete view of what was driving user engagement and conversion events (such as registrations). 



2017: On the roadmap



After a thorough survey of current marketing technology capabilities and needs, deep linking and attribution were named as high-priority gaps that needed to be filled. We collected the findings of the survey into a report and circulated it broadly within Spotify to boost visibility of the issues and garner support for resolving them, but the road ahead was going to be a bumpy one.



For one, deep linking and attribution use cases, knowledge, and ownership were distributed across Spotify, crossing multiple business units, Missions, squads, and functional domains (engineering, marketing, analytics, etc.). It was a challenge to make goals for such an unaffiliated group with so many different objectives and key results (OKRs).



As a first step, we wrote a formal problem statement along with a prioritized backlog of known issues. These were shared and discussed with stakeholders to further build support for fixing the individual issues and progressing toward a better overall solution.



2018: Incremental progress



In 2018, we gained momentum by actively fixing bugs and bringing attention to the impacts of the bugs that remained.



One of the primary owners of deep linking reviewed the 2017 report and committed to prioritizing improvements. They made progress on the highest-impact issues in the backlog and planned the rest for future sprints.



In the meantime, to increase visibility of the impacts and build urgency for addressing the issues, we drafted a business case based on past benchmarks and outlined the impacts to ongoing Company Bets.



2019: *Collaboration intensifies*



By 2019, multiple R&D teams were investigating ways to improve the deep linking user experience. One team in particular began evaluating alternative deep linking solutions. Our team started collecting empirical data from a group of test users about the deep linking user experience. We used that data to add to the deep linking backlog and inform the priority of the bugs we discovered.



The metadata and screen recordings from the deep link testers not only helped us prioritize bugs but also helped us communicate what was broken. This direct communication helped dev teams understand more quickly and resolve the bugs faster.



2020: Things get formal(er)



In 2020, our informal group of cross-Mission R&D teams formalized our meeting structure and cadence, and we gave ourselves a name, the (Deep Link) Jedi Council. But we still weren’t a formal group, yet.



In other, more formal(er), news, the squad evaluating alternative solutions began a short-term contract to test a proof of concept of a promising solution to our many deep linking woes. This solution also offered potential improvements for attribution.



2021: The migration begins



In early 2021, the results of the proof of concept revealed positive outcomes for deep linking (such as a 79% reduction in broken links). By removing friction from the deep linking UX, the team also saw significant increases in engagement with linked content. These developments got a lot of positive attention and bolstered our collective energy.



To achieve greater consistency in deep linking UX and to realize the many benefits to attribution, our team took the lead in making the case for migrating all attribution and all Spotify apps to the new solution. 



After considerable campaigning to share our vision and insights, the project was approved, and we began an enterprise-wide migration that impacted at least 25 internal stakeholder teams and external partners.



2022: The migration continues



Because of the nuance and volume of deep linking and attribution use cases, the migration continued until the end of 2022. We finished the official scope of the migration shortly before the end of the year.



But our work was not done.



2023+: Now and the future



While we have technically integrated the new deep linking and attribution solution throughout all current apps and use cases, not all teams are aligned on when/why/how to use it. So we have some work to do in order to achieve a comprehensive view of attribution. 



Further, every day our R&D and marketing teams think up incredible new products, features, and campaigns that can benefit from a frictionless deep linking UX and a reliable, comprehensive view of attribution. We will continue to support these efforts, as well.



Every new use case we support offers us a new perspective on our own tech — and how to improve it. And there’s always room for improvement! 



Challenges & takeaways



Looking back at our collective effort over the past five years, we know we did our best and found successes and difficulties along the way. Here are some of our most noteworthy challenges and takeaways:



Challenge 1: Working with an incomplete picture



Due to the nature of deep linking and attribution, there are numerous aspects of each functionality that we had no insight into. For instance, we could not record how long it takes for a link to open, because the click occurs outside our platform and, in most cases, is completely handled by a device’s OS (i.e., no request whatsoever goes to Spotify infrastructure; rather, the OS simply opens the app). Similarly, if a click originates in another app, such as Facebook, it often introduces a mobile web browser or pop-up that keeps you in that app. These “features” are friction points in the deep linking UX that we simply cannot measure programmatically. 



In addition, our attribution had many blind spots, and we lacked the ability to understand overlaps in marketing activity or even to identify which activity was truly organic (initiated by the user without any kind of prompt).



Lacking a clear picture of what was going wrong made it difficult to estimate and communicate the impact of the issues we knew about. Our ability to see and share the deep linking UX firsthand via videos from our UX testing aided in our ability to communicate what was going on and how often.



Takeaway 1: Look for the big picture and the little picture



At first, deep linking problems appeared to be small and isolated, and attribution wasn’t even on most teams’ minds. With a broader understanding of the problem, patterns began to emerge and new solutions started to seem more applicable. 



When we looked closely, we couldn’t see how to solve the many small problems or why the effort would be worthwhile. But when we zoomed out for the big picture, the solution and the business case became much clearer. And much more significant.



Challenge 2: Complex tech and numerous points of failure



It is difficult to implement a consistent deep linking UX — it has to work on multiple OS’s, from several apps, and under other widely varying circumstances. Surprising and even small potential changes in numerous different pieces of software (including our own) can break the deep linking UX. 



Apple’s recent privacy-focused features in iOS 14 and 15 are examples of changes that we had to account for in our deep linking solution. In each case we had to reprioritize our backlog and reassess our timeline to make sure we knew what we needed to do and when.



All this to say, there are innumerable places where deep links can break. Without proper monitoring and support, something is bound to break them. This was constantly on our minds, and sometimes at the forefront, when things broke, or were very likely to break, in a big way.



Takeaway 2: Be persistent; build momentum.



Where we are today was five years in the making.



At the beginning, we had little to no understanding of the intricacies of deep linking and attribution. We built that expertise as we went.



Needless to say, we didn’t start out fast, and we didn’t know exactly where we were going or how to get there.



Over time, by being thoughtful and purposeful (and giving ourselves some grace now and again), all the pieces fell into place. But not without persistently and tirelessly doing our part to make it work out the way it needed to.



Challenge 3: Creating alignment between disparate teams



Our informal working group was dispersed across the company with little to no overlap in stakeholder use cases. We rarely, if ever, aligned on the same low-level KPIs.



Each team had its own priorities, was part of a distinct hierarchical structure within Spotify, and reported on different metrics to different leaders. There was no single authority overseeing these efforts. There was no single person that all the groups shared in common.



So when it came to reaching alignment on what needed to happen, in what order, and on what timelines… we all often had different perspectives and constraints.



Takeaway 3: Lean into collaboration and communication



This is a collaboration success story. Despite the odds against us, Spotifiers across many disparate teams came together to solve challenging and impactful problems.



One key factor in our success was leaning into collaboration and leveraging each other’s strengths and knowledge to make progress toward our common goals.



Along the way we learned a few effective strategies for achieving this:



Speak a common language



As I mentioned, we rarely shared stakeholder groups or KPIs with our collaborators.



One way to bridge this gap was to look at opportunities from the other team’s perspective and communicate their need for urgency to them. We would frame the issue in their own KPIs, showing them how the changes we wanted would complement their regular work. This method also gave them the language and statistics to communicate the impact to their peers and leaders.



Another effective approach was to look at higher-level KPIs impacted by the expected improvements in the different teams’ distinct lower-level KPIs. For instance, instead of focusing on deep link error rates or sharing rates, we might look at engagement that resulted from a shared deep link. In cases like this, we often framed the issue from our and the other teams’ perspectives, sharing the improvements to our own KPIs to emphasize the benefits and round out the story we wanted to tell.



Start with understanding



We also rarely shared “basic” domain knowledge with our collaborators. Meaning we couldn’t assume they were familiar with the day-to-day knowledge we take for granted, the “basics” of our domain.



And the same went for us about our collaborators’ domains. We were total noobs.



We found the best way to approach this was with humility, curiosity, and some grace. Ultimately, we wanted to understand and to do that the best way possible. So we didn’t assume anything about what anyone else knew or understood; we asked questions with answers that might have been obvious to others; we gave everyone the benefit of the doubt; we provided as much explicit explanation as possible.



Show, don’t tell



One of the major turning points came after we began empirical UX testing. The testing resulted in screen recordings of the actual UX that we could share internally. We could much more easily show, rather than describe, the issues that were occurring with deep links. Showing these firsthand videos of testers’ experiences, with minimal commentary from us (perhaps only including a stat or two) was an immensely more effective way to communicate what was going wrong and why.



What’s next?



Beyond our vision of a comprehensive view of attribution and continuing to support all the amazing new products and campaigns Spotify teams think up, we want to continue iterating on our existing support structure and advocating for changes we believe will unlock even greater potential for our business.



Further, deep linking and attribution are only two of many more martech capabilities that have fallen into gray areas of tech ownership and support. The situations for those other features won’t mirror exactly what we observed with deep linking and attribution, but we are certain the skills we developed through this experience will help us be successful in those new scenarios, as well.



We are excited to see what other big challenges we can take on. And we can’t wait to share those with you in the future.
        

        Tags: backend
