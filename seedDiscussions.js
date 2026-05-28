/**
 * Seed script — inserts 25 realistic discussions and asks the Python RAG
 * service to generate Gemini embeddings for each.
 *
 * Run from the Backend folder:
 *   node scripts/seedDiscussions.js
 *
 * Requires:
 *   - Backend/.env with MONGODB_URL
 *   - rag-service running on http://localhost:8001 (or RAG_SERVICE_URL)
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { discussion } from '../models/Discussion.model.js';
import { embedDiscussion } from '../services/ragService.js';

const SEED_DISCUSSIONS = [
    // ===== Competitive Programming (5) =====
    {
        title: "How I jumped from 1200 to 1700 on Codeforces in 4 months",
        content:
            "Sharing what actually worked for me. I started at 1200 last December and " +
            "hit 1700 specialist last month. The biggest unlock was doing virtual contests " +
            "on weekends — pick a Div 2 round from 6 months ago, solve under timer. Stop " +
            "watching editorials immediately; let yourself sit with a problem for at least " +
            "45 minutes. I also bumped my problem rating to (current_rating + 200) for " +
            "practice — too easy is just dopamine, too hard is depressing. Topics that gave " +
            "me the biggest jump: prefix sums + difference arrays, binary search on answer, " +
            "and DP on subsets. Number theory and graphs came later. AMA in the comments.",
        tags: ["codeforces", "competitive-programming", "improvement", "practice"],
        category: "competitive-programming"
    },
    {
        title: "LeetCode pattern recognition cheat sheet for placements",
        content:
            "After 600+ LeetCode problems and three placement seasons, I noticed almost every " +
            "question maps to 12 patterns: sliding window, two pointers, fast & slow pointers, " +
            "merge intervals, cyclic sort, in-place reversal, BFS, DFS, two heaps, subsets, " +
            "modified binary search, top-K elements, and bitwise XOR. If you can recognize the " +
            "pattern in 30 seconds, you've already won. I'd recommend Grokking the Coding " +
            "Interview as a starting framework, then drill 5 problems per pattern on LeetCode. " +
            "Don't grind randomly — grind by pattern.",
        tags: ["leetcode", "patterns", "interview-prep"],
        category: "competitive-programming"
    },
    {
        title: "Codeforces Round 920 problem D analysis",
        content:
            "Lots of confusion in the post-contest chat about Div 2 D. The key observation " +
            "was that the operation preserves the multiset of pairwise XORs. Once you see that, " +
            "the problem reduces to checking whether the source and target arrays have the same " +
            "XOR-difference signature. Time complexity O(n log n) with sorting. I struggled " +
            "for 50 minutes trying DP before reading the problem statement carefully — the " +
            "constraints (n ≤ 2*10^5) ruled out anything quadratic. Has anyone solved E yet?",
        tags: ["codeforces", "contest-analysis", "xor", "div2"],
        category: "competitive-programming"
    },
    {
        title: "Best resources for learning Segment Trees from scratch",
        content:
            "Segment trees were terrifying to me for months. What finally clicked: 1) cp-algorithms.com " +
            "for the theory, 2) Errichto's YouTube series — he builds a segment tree live in 30 " +
            "minutes, 3) practice on Codeforces EDU section which has guided problems. After that, " +
            "tackle lazy propagation. Don't skip the recursive understanding before moving to " +
            "iterative. Problems I'd recommend: GSS1 on SPOJ, then GSS3, then any problem tagged " +
            "data structures on Codeforces between 1800-2100. By the time you solve five such " +
            "problems, segment trees are no longer scary.",
        tags: ["segment-tree", "data-structures", "resources"],
        category: "competitive-programming"
    },
    {
        title: "Why I stopped doing competitive programming and you might too",
        content:
            "Controversial post but hear me out. I was 1900 on Codeforces and realized I had " +
            "spent 2 years optimizing for a skill that almost no real job tests. Most interviews " +
            "ask LeetCode-medium difficulty problems, not Codeforces Div 1 E. Time that could " +
            "have gone into building projects, learning system design, or contributing to open " +
            "source went into solving artificial problems. CP is fun, but if your goal is " +
            "placement, you hit diminishing returns at ~1500. Spend the next 100 hours on " +
            "projects instead. Roast me in the comments.",
        tags: ["competitive-programming", "career", "controversial"],
        category: "competitive-programming"
    },

    // ===== Interview Experience (7) =====
    {
        title: "TCS Digital interview experience — selected with 11 LPA",
        content:
            "Got selected for TCS Digital last month. Process: aptitude → coding → tech " +
            "interview → managerial → HR. Aptitude was Quants + Verbal + Logical — easy if you " +
            "did RS Aggarwal. Coding round had 2 problems: reverse a linked list and find the " +
            "longest substring without repeating characters. Tech interview was 50 minutes, all " +
            "DSA — they asked about hash maps, time complexity of my Java HashMap solution, and " +
            "one DBMS question on normalization. Managerial was situational — 'what if your " +
            "teammate doesn't deliver'. HR asked about relocation and salary expectations. Final " +
            "offer: 11.5 LPA. Tips: be confident, don't say 'I don't know' — say 'let me think out loud'.",
        tags: ["tcs", "tcs-digital", "interview", "placement"],
        category: "interview-experience"
    },
    {
        title: "Infosys System Engineer Specialist interview — full experience",
        content:
            "Applied through campus, cleared the InfyTQ certification first which is mandatory. " +
            "Then InfyTQ assessment — 90 minutes of coding + MCQs, must score 65+. Tech interview " +
            "started with project deep-dive — they grilled me on my React project for 25 minutes, " +
            "asked about state management, why Redux vs Context, how I handled API errors. Then " +
            "two coding questions on paper: implement a queue using two stacks, and SQL query for " +
            "second highest salary. HR was painless — just resume review and questions about " +
            "relocation. Got 8 LPA offer for SES role. Process took 6 weeks end-to-end.",
        tags: ["infosys", "system-engineer", "infytq", "interview"],
        category: "interview-experience"
    },
    {
        title: "Cognizant GenC Next interview — landed 9 LPA",
        content:
            "Cognizant's GenC Next is their flagship campus hire program — 9 LPA versus 4 LPA " +
            "for vanilla GenC. The catch: you need to clear their proprietary coding round which " +
            "is harder than typical service company tests. Two problems, 90 minutes, on their " +
            "platform. Mine had a sliding window problem and a graph BFS. Tech interview was " +
            "intense — they spent 40 minutes on my AI project, asked about prompt engineering, " +
            "RAG concepts, and why I chose certain libraries. HR was friendly. The newer Cognizant " +
            "Ace Team program is even more selective with 12-18 LPA — focus on AI full-stack skills " +
            "if you want that track. Mock interview before applying.",
        tags: ["cognizant", "genc-next", "ace-team", "interview"],
        category: "interview-experience"
    },
    {
        title: "Wipro Elite NTH experience and tips",
        content:
            "Wipro Elite NTH is open to all CS branches with 60% throughout. Three rounds: " +
            "online assessment, tech interview, HR. Online assessment had aptitude, English, " +
            "and 2 coding problems — palindrome check and a simple array manipulation. Tech " +
            "interview started with self-intro, then OOPs concepts (inheritance, polymorphism), " +
            "one SQL query, and a coding question — reverse words in a string. HR was very " +
            "short, basically just confirming the offer. Final package: 3.5 LPA for general, " +
            "6.5 LPA if you cleared turbo round. Process was smooth, results came in 2 weeks.",
        tags: ["wipro", "elite-nth", "interview", "placement"],
        category: "interview-experience"
    },
    {
        title: "Accenture associate software engineer interview",
        content:
            "Accenture's process: cognitive assessment + technical assessment + communication " +
            "test + interview. Cognitive was easy aptitude. Tech assessment had MCQs on Java, " +
            "DBMS, networking. Communication was a recorded speaking test — they evaluate " +
            "fluency. Interview was 30 minutes, mostly behavioral — strengths, weaknesses, why " +
            "Accenture. One technical question: difference between abstract class and interface " +
            "in Java. Got the offer at 4.5 LPA + variable. Tip: their AI proctoring is strict — " +
            "no eye movement, no background noise, full webcam visible.",
        tags: ["accenture", "interview", "placement", "associate"],
        category: "interview-experience"
    },
    {
        title: "Capgemini exceller interview — beware these gotchas",
        content:
            "Cleared Capgemini Exceller (7.5 LPA track). Heads up on three traps: 1) Their " +
            "pseudo-code section is harder than expected — practice converting English problem " +
            "statements into pseudo-code, 2) Behavioral round has weird hypotheticals like " +
            "'your team is celebrating but you're sad — what do you do', 3) They check your " +
            "social media — keep LinkedIn clean and don't have controversial public posts. " +
            "Tech interview was OOPs, SQL, and one DSA problem (find duplicate in array). " +
            "Offer letter came in 3 weeks.",
        tags: ["capgemini", "exceller", "interview", "tips"],
        category: "interview-experience"
    },
    {
        title: "Amazon SDE-1 interview from tier-3 college",
        content:
            "Yes it's possible from a tier-3 college. Applied through the Amazon WoW program " +
            "after solving 250+ LeetCode mediums. Five rounds: online assessment (2 coding + " +
            "work simulation), then four interviews — two coding, one system design (light), " +
            "one behavioral with leadership principles. Coding questions: LRU cache, top K " +
            "frequent elements, merge intervals, design a parking lot. System design was a URL " +
            "shortener — they want you to talk about hashing, database choice, scaling. " +
            "Behavioral round is where most people fail — memorize STAR-format stories for at " +
            "least 8 of the 16 leadership principles. Got the offer at 44 LPA.",
        tags: ["amazon", "sde-1", "system-design", "leadership-principles"],
        category: "interview-experience"
    },

    // ===== Placement Prep (5) =====
    {
        title: "My 6-month DSA prep plan that got me 5 offers",
        content:
            "Month 1: Arrays, strings, linked lists — Striver's SDE sheet. Month 2: Stacks, " +
            "queues, trees — solve every problem from Love Babbar's 450. Month 3: DP — Aditya " +
            "Verma's playlist, then DP problems on LeetCode tagged 'medium'. Month 4: Graphs — " +
            "Striver's graph series end to end. Month 5: System design lite + OOPs + DBMS — " +
            "Gaurav Sen YouTube + Striver's CS fundamentals sheet. Month 6: Mock interviews on " +
            "Pramp daily, behavioral prep, and resume polishing. Daily target: 2 problems " +
            "minimum. Weekly: 1 contest on Codeforces or LeetCode. Got offers from TCS Digital, " +
            "Infosys SES, Cognizant GenC Next, Capgemini Exceller, and a startup.",
        tags: ["dsa", "prep-plan", "striver", "love-babbar"],
        category: "placement-prep"
    },
    {
        title: "Resume template that actually gets shortlisted",
        content:
            "Tips from someone who shortlisted 12 of 15 companies: 1) One page, no exceptions. " +
            "2) Use the Jake's resume LaTeX template — clean, ATS-friendly. 3) Skills section " +
            "should be sorted by proficiency, not alphabetically. 4) Each project bullet should " +
            "have IMPACT — 'reduced API latency by 40% via Redis caching' beats 'used Redis'. " +
            "5) Don't list 50 skills — pick 15 and own them in the interview. 6) Include " +
            "leadership/extracurricular if you have them — recruiters love it. 7) PROOFREAD. " +
            "I've seen resumes with 'Javasrcipt' get auto-rejected. Get 3 people to review yours.",
        tags: ["resume", "placement-prep", "template", "tips"],
        category: "placement-prep"
    },
    {
        title: "Mock interview platforms ranked — what's worth your time",
        content:
            "Tried all of them. My ranking: 1) Pramp — free, peer-to-peer, good quality if you " +
            "match with a serious peer. 2) Interviewing.io — anonymous, with engineers from " +
            "FAANG. Has free credits. 3) AlgoExpert mock interviews — paid but curated. 4) " +
            "InterviewBit — okay practice, but matched peers are hit or miss. 5) College mock " +
            "drives — great for behavioral practice, weak for technical depth. Recommended " +
            "cadence: 1 mock per week starting 8 weeks before placements. Treat each mock like " +
            "the real thing — dress up, no distractions, full 45 minutes.",
        tags: ["mock-interview", "pramp", "placement-prep"],
        category: "placement-prep"
    },
    {
        title: "Aptitude prep — what actually shows up in tests",
        content:
            "Service companies (TCS, Infy, Wipro) lean heavy on aptitude. Topics that appear " +
            "in 80% of tests: 1) Time and work, 2) Percentages, profit & loss, 3) Permutations " +
            "and combinations, 4) Probability, 5) Number series. RS Aggarwal Quant book is " +
            "still the gold standard. For verbal: reading comprehension and synonyms/antonyms. " +
            "Logical reasoning: coding-decoding, blood relations, syllogisms. Don't waste time " +
            "on advanced topics — focus on the basic 10 chapters and solve at LEAST 30 problems " +
            "from each. IndiaBix.com has free question banks.",
        tags: ["aptitude", "placement-prep", "tcs", "infosys"],
        category: "placement-prep"
    },
    {
        title: "How to revise CS fundamentals (OOPs, DBMS, OS, Networks) in 2 weeks",
        content:
            "If you're 2 weeks from placements and haven't started CS fundamentals — don't " +
            "panic. Day 1-3: OOPs (4 pillars, abstract vs interface, virtual functions, " +
            "polymorphism, real-world examples). Day 4-7: DBMS (normalization, ACID, joins, " +
            "transactions, indexes, NoSQL vs SQL). Day 8-11: OS (process vs thread, deadlock, " +
            "scheduling algorithms, memory management, paging). Day 12-14: Networks (OSI vs " +
            "TCP/IP, TCP vs UDP, DNS, HTTPS handshake). Resource: GeeksforGeeks CS Theory " +
            "section + InterviewBit cheat sheets. Do 5 mock Q&A per topic daily.",
        tags: ["cs-fundamentals", "oops", "dbms", "os", "networks"],
        category: "placement-prep"
    },

    // ===== Tech Discussion (4) =====
    {
        title: "React vs Next.js — which one for college projects in 2024",
        content:
            "Heated debate in our last meetup. My take: if your project is a simple SPA with no " +
            "SEO needs (like Campus Connect, dashboards, internal tools), plain React + Vite is " +
            "faster to build. If you need SSR, file-based routing, or you're showing a portfolio " +
            "to recruiters who'll Google your live URL, use Next.js. Next.js also has built-in " +
            "API routes which means you don't need a separate Express backend for small projects. " +
            "Performance-wise Next.js wins on first-load (SSR + image optimization). DX-wise, " +
            "Vite is faster for development. Pick based on USE CASE, not hype.",
        tags: ["react", "nextjs", "frontend", "comparison"],
        category: "tech-discussion"
    },
    {
        title: "Which language should I learn first — Python, Java, or C++",
        content:
            "If you're targeting placements at service companies: Java is the safe bet because " +
            "Infosys, TCS, Wipro, Capgemini are Java shops. If you're targeting AI/ML, Python " +
            "is non-negotiable. If you want maximum competitive programming performance, C++ " +
            "wins because of STL and speed. My recommendation for CS students: become fluent " +
            "in ONE deeply (Java or Python), and know enough C++ to compete in CP. Trying to " +
            "be 'good' at all three usually means mediocre at all three. Mastery of one shows " +
            "depth in interviews — the next language is a 3-week pickup.",
        tags: ["programming-language", "python", "java", "cpp"],
        category: "tech-discussion"
    },
    {
        title: "Best free system design resources for fresher interviews",
        content:
            "System design as a fresher is becoming a thing — not deep, but you're expected to " +
            "talk about a URL shortener or a chat app at a high level. Free resources I used: " +
            "1) Gaurav Sen YouTube — great for foundational concepts (load balancers, sharding, " +
            "consistent hashing). 2) The System Design Primer GitHub repo by donnemartin — gold " +
            "mine. 3) ByteByteGo newsletter (free tier) — visual explanations. 4) Hello Interview " +
            "YouTube — newer channel with mock-interview format. Don't over-prepare — for " +
            "freshers, knowing how to design a parking lot, a URL shortener, and a basic chat " +
            "system is enough.",
        tags: ["system-design", "resources", "interview-prep"],
        category: "tech-discussion"
    },
    {
        title: "Vector databases explained — when do you actually need one",
        content:
            "AI hype is making everyone want to add a vector DB to their project. Here's when " +
            "you actually need one: 1) You have 10K+ documents and need semantic search. 2) " +
            "You're building a RAG system over a knowledge base. 3) You need approximate " +
            "nearest-neighbor at scale. Options: Pinecone (managed, easy, paid), Weaviate " +
            "(open-source, strong filters), Qdrant (open-source, Rust-fast), MongoDB Atlas " +
            "Vector Search (just an index on your existing collection — minimal new infra). " +
            "For college projects with <1000 docs, you don't need one — naive cosine similarity " +
            "over in-memory vectors works fine. Pick MongoDB Atlas Vector Search if your data " +
            "is already in Mongo.",
        tags: ["vector-db", "rag", "ai", "mongodb"],
        category: "tech-discussion"
    },

    // ===== Career Advice (4) =====
    {
        title: "Product company vs service company — honest comparison",
        content:
            "Done both. Service (TCS, Infosys, Wipro, Cognizant): pros are job security, " +
            "structured training, lower bar to enter, good for beginners. Cons: slower learning " +
            "curve, bench periods, manual work, lower pay. Product (Amazon, Microsoft, " +
            "startups): pros are higher pay (2-3x), faster learning, modern stack, equity. " +
            "Cons: harder interviews, higher pressure, less stability. My honest advice: target " +
            "product companies if you've done 200+ LeetCode and built solid projects. If you're " +
            "not there yet, take a service offer, get 1-2 years of real experience, then switch. " +
            "Don't reject offers ego-trip-style waiting for the perfect one — that perfect one " +
            "may never come.",
        tags: ["product-vs-service", "career", "comparison"],
        category: "career-advice"
    },
    {
        title: "Does CGPA actually matter — data from 50 placed seniors",
        content:
            "Surveyed 50 placed seniors from our college. Data: 1) Service companies (TCS, " +
            "Infy, Wipro) — strict 60% / 6.5 CGPA cutoff, doesn't matter if you have 9.5 vs " +
            "7.0 above that. 2) Cognizant GenC Next — soft cutoff of 7.0, exceptions made for " +
            "strong projects. 3) Product companies — many have no cutoff or 7.0. They care way " +
            "more about LeetCode + projects. 4) FAANG and tier-1 startups — projects, GitHub, " +
            "and CP rating matter more than CGPA. Conclusion: above 7.5, CGPA is just a filter. " +
            "Below 7.0, you'll get filtered out of mass-recruiters. Focus on getting 7+ and " +
            "then maximizing everything else.",
        tags: ["cgpa", "career", "placements"],
        category: "career-advice"
    },
    {
        title: "Open source contributions — how to start as a fresher",
        content:
            "Open source helped me 10x more than CP for landing interviews. My path: 1) Started " +
            "with documentation typo fixes on popular repos (React, Tailwind) — that gave me " +
            "GitHub green squares. 2) Joined Hacktoberfest in October — easy first PRs. 3) " +
            "Picked one library I actually used (a small npm package) and fixed two real bugs. " +
            "4) Contributed to a larger project (FreeCodeCamp curriculum) over 3 months. By the " +
            "time of placements, I had 40+ merged PRs and one recruiter cold-DMed me on LinkedIn " +
            "after seeing my GitHub. Time investment: 4 hours/week. Start NOW even if it's just " +
            "a README typo fix — momentum compounds.",
        tags: ["open-source", "github", "hacktoberfest", "career"],
        category: "career-advice"
    },
    {
        title: "Should I do MS or take a job offer — thinking out loud",
        content:
            "Stuck between a 12 LPA offer and an MS admit (GeorgiaTech, ~50L total cost). " +
            "Reasoning: MS makes financial sense if you want US/Europe jobs OR want to " +
            "pivot to AI/ML research roles that need a Master's. Job makes sense if you want " +
            "to start earning, build savings, and the offer is at a good company with growth " +
            "trajectory. Personal heuristic: if your dream is research / FAANG-US, MS is worth " +
            "the loan. If you're happy at any product company in India, take the job — you can " +
            "always do MS later with employer sponsorship. Currently leaning job + part-time " +
            "online MS (Georgia Tech OMSCS is just 10L).",
        tags: ["ms-vs-job", "career", "higher-studies"],
        category: "career-advice"
    },
];

async function seed() {
    const mongoUrl = process.env.MONGODB_URL;
    if (!mongoUrl) {
        console.error('MONGODB_URL not set — aborting');
        process.exit(1);
    }

    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');

    const existing = await discussion.countDocuments({});
    console.log(`Existing discussion count: ${existing}`);
    if (existing >= 10) {
        console.log('Already seeded, skipping');
        await mongoose.disconnect();
        return;
    }

    const inserted = [];
    for (let i = 0; i < SEED_DISCUSSIONS.length; i++) {
        const doc = SEED_DISCUSSIONS[i];
        const record = await discussion.collection.insertOne({
            title: doc.title,
            content: doc.content,
            tags: doc.tags,
            category: doc.category,
            createdBy: { username: 'seed_user', id: null },
            likes: 0,
            views: 0,
            comments: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        inserted.push({ _id: record.insertedId, ...doc });
        console.log(`[${i + 1}/${SEED_DISCUSSIONS.length}] Inserted: ${doc.title.slice(0, 60)}`);
    }

    console.log(`\nGenerating embeddings via ragService ...`);
    for (let i = 0; i < inserted.length; i++) {
        const d = inserted[i];
        const result = await embedDiscussion(d);
        if (result?.success) {
            console.log(`[${i + 1}/${inserted.length}] Embedded (${result.dimensions} dims): ${d.title.slice(0, 60)}`);
        } else {
            console.error(`[${i + 1}/${inserted.length}] Embedding failed for "${d.title.slice(0, 60)}": ${result?.error || 'unknown'}`);
        }
    }

    console.log('\nSeeding complete.');
    await mongoose.disconnect();
}

seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
