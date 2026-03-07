
const mongoose = require('mongoose');
const path = require('path');

// Mock Next.js environment
process.env.MONGODB_URI = 'mongodb+srv://db_writer:bXm8dm0phhbekJ0Q@cluster0.m16rtdu.mongodb.net/?appName=Cluster0';

async function debugHomepage() {
    try {
        const dbConnect = require('../src/lib/db').default;
        // We need to register models manually since we are outside Next.js
        require('../src/models/Article');
        require('../src/models/Category');
        require('../src/models/Photo');
        require('../src/models/Video');
        // Force re-register HomepageSetting to avoid stale schema
        delete mongoose.models.HomepageSetting;
        const HomepageSettingSchema = new mongoose.Schema({
            section: { type: String },
            type: { type: String },
            categorySlug: { type: String },
            isVisible: { type: Boolean },
            order: { type: Number },
            title: { type: String },
        });
        const HomepageSetting = mongoose.model('HomepageSetting', HomepageSettingSchema);
        const Category = mongoose.model('Category');
        const Article = mongoose.model('Article');

        await dbConnect();
        console.log('Connected to DB');

        // 1. Fetch Settings
        const settings = await HomepageSetting.find({ isVisible: true }).sort({ order: 1 }).lean();
        console.log('--- Settings ---');
        console.log(JSON.stringify(settings, null, 2));

        // 2. Fetch Categories
        const allCategories = await Category.find({}).lean();
        console.log('--- Categories ---');
        console.log(allCategories.map(c => `${c.name} (${c.slug})`).join(', '));
        
        const slugToName = allCategories.reduce((acc, cat) => {
            acc[cat.slug] = cat.name;
            return acc;
        }, {});

        // 3. Simulate Data Fetching for Dynamic Sections
        const dynamicSections = settings.filter(s => s.type === 'category');
        console.log(`--- Dynamic Sections Found: ${dynamicSections.length} ---`);

        for (const section of dynamicSections) {
            console.log(`Checking Section: ${section.title} (Slug: ${section.categorySlug})`);
            
            if (section.categorySlug && slugToName[section.categorySlug]) {
                const catName = slugToName[section.categorySlug];
                console.log(` -> Resolved Category Name: "${catName}"`);
                
                const articleCount = await Article.countDocuments({ category: catName });
                console.log(` -> Articles Found: ${articleCount}`);
                
                if (articleCount === 0) {
                    console.warn(`WARNING: Section "${section.title}" will NOT render because it has 0 articles.`);
                }
            } else {
                console.error(`ERROR: Could not resolve slug "${section.categorySlug}" to a Category Name.`);
                console.log('Available slugs:', Object.keys(slugToName));
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Debug Error:', error);
        process.exit(1);
    }
}

debugHomepage();
