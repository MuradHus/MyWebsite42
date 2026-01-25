// Articles Data
const articles = {
    mathematics: {
        ar: {
            title: "عالم الرياضيات المذهل",
            date: "25 يناير 2026",
            body: `
                <h2>مقدمة</h2>
                <p>الرياضيات هي لغة الكون، وهي الأداة التي نستخدمها لفهم العالم من حولنا. من الأرقام البسيطة إلى المعادلات المعقدة، تلعب الرياضيات دوراً حيوياً في حياتنا اليومية.</p>
                
                <h2>جمال الأعداد</h2>
                <p>منذ فجر التاريخ، سحرت الأعداد البشرية. الأعداد الأولية، النسبة الذهبية، ومتتالية فيبوناتشي - كلها أمثلة على روعة الرياضيات الطبيعية.</p>
                
                <h3>النسبة الذهبية (φ ≈ 1.618)</h3>
                <p>تظهر النسبة الذهبية في الطبيعة بشكل مذهل - في أصداف الحلزون، ترتيب بتلات الأزهار، وحتى في أبعاد جسم الإنسان. استخدمها الفنانون والمهندسون المعماريون عبر العصور لخلق تصاميم متناسقة وجميلة.</p>
                
                <h2>الرياضيات في العصر الحديث</h2>
                <p>في عصرنا الرقمي، أصبحت الرياضيات أكثر أهمية من أي وقت مضى. من خوارزميات التشفير التي تحمي بياناتنا، إلى نماذج الذكاء الاصطناعي التي تتعلم وتتطور، الرياضيات هي القلب النابض للتكنولوجيا الحديثة.</p>
                
                <h3>التطبيقات العملية</h3>
                <p>تستخدم الرياضيات في كل شيء من توقعات الطقس إلى تحليل الأسواق المالية، من تصميم الطائرات إلى تطوير الأدوية الجديدة.</p>
                
                <h2>الخاتمة</h2>
                <p>الرياضيات ليست مجرد أرقام ومعادلات - إنها طريقة تفكير، أداة لحل المشكلات، ونافذة لفهم أسرار الكون. كلما تعمقنا في دراستها، كلما اكتشفنا المزيد من جمالها وقوتها.</p>
            `
        },
        en: {
            title: "The Amazing World of Mathematics",
            date: "January 25, 2026",
            body: `
                <h2>Introduction</h2>
                <p>Mathematics is the language of the universe, and it is the tool we use to understand the world around us. From simple numbers to complex equations, mathematics plays a vital role in our daily lives.</p>
                
                <h2>The Beauty of Numbers</h2>
                <p>Since the dawn of history, numbers have fascinated humans. Prime numbers, the golden ratio, and the Fibonacci sequence - all are examples of the beauty of natural mathematics.</p>
                
                <h3>The Golden Ratio (φ ≈ 1.618)</h3>
                <p>The golden ratio appears amazingly in nature - in spiral shells, the arrangement of flower petals, and even in the proportions of the human body. Artists and architects have used it throughout the ages to create harmonious and beautiful designs.</p>
                
                <h2>Mathematics in the Modern Age</h2>
                <p>In our digital age, mathematics has become more important than ever. From encryption algorithms that protect our data, to artificial intelligence models that learn and evolve, mathematics is the beating heart of modern technology.</p>
                
                <h3>Practical Applications</h3>
                <p>Mathematics is used in everything from weather forecasting to financial market analysis, from aircraft design to developing new medicines.</p>
                
                <h2>Conclusion</h2>
                <p>Mathematics is not just numbers and equations - it is a way of thinking, a tool for solving problems, and a window to understanding the secrets of the universe. The deeper we delve into its study, the more we discover its beauty and power.</p>
            `
        }
    },
    science: {
        ar: {
            title: "اكتشافات علمية مذهلة",
            date: "25 يناير 2026",
            body: `
                <h2>العلم والاكتشاف</h2>
                <p>العلم هو المحرك الأساسي للتقدم البشري. من خلال الملاحظة، التجربة، والتحليل، نكتشف أسرار الطبيعة ونطور حلولاً لأكبر تحديات البشرية.</p>
                
                <h2>الثورات العلمية</h2>
                <p>شهد التاريخ العديد من الثورات العلمية التي غيرت فهمنا للعالم بشكل جذري...</p>
            `
        },
        en: {
            title: "Amazing Scientific Discoveries",
            date: "January 25, 2026",
            body: `
                <h2>Science and Discovery</h2>
                <p>Science is the fundamental driver of human progress. Through observation, experimentation, and analysis, we discover the secrets of nature and develop solutions to humanity's greatest challenges.</p>
                
                <h2>Scientific Revolutions</h2>
                <p>History has witnessed many scientific revolutions that radically changed our understanding of the world...</p>
            `
        }
    },
    technology: {
        ar: {
            title: "عصر التكنولوجيا",
            date: "25 يناير 2026",
            body: `
                <h2>التكنولوجيا تشكل المستقبل</h2>
                <p>نعيش في عصر التطور التكنولوجي السريع، حيث تتغير حياتنا بشكل جذري كل يوم بفضل الابتكارات الجديدة.</p>
            `
        },
        en: {
            title: "The Age of Technology",
            date: "January 25, 2026",
            body: `
                <h2>Technology Shapes the Future</h2>
                <p>We live in an era of rapid technological development, where our lives change radically every day thanks to new innovations.</p>
            `
        }
    },
    ai: {
        ar: {
            title: "مستقبل الذكاء الاصطناعي",
            date: "25 يناير 2026",
            body: `
                <h2>الذكاء الاصطناعي يغير العالم</h2>
                <p>الذكاء الاصطناعي لم يعد خيالاً علمياً - إنه حقيقة تؤثر على كل جانب من جوانب حياتنا اليومية.</p>
            `
        },
        en: {
            title: "The Future of Artificial Intelligence",
            date: "January 25, 2026",
            body: `
                <h2>AI is Changing the World</h2>
                <p>Artificial intelligence is no longer science fiction - it is a reality affecting every aspect of our daily lives.</p>
            `
        }
    }
};

// Current state
let currentArticle = null;
let currentLang = 'ar'; // Default language

// Open article
function openArticle(articleId) {
    currentArticle = articleId;
    const modal = document.getElementById('articleModal');
    const container = document.getElementById('articlesContainer');
    
    // Get current language preference from body class
    if (document.body.classList.contains('lang-en')) {
        currentLang = 'en';
    } else {
        currentLang = 'ar';
    }
    
    // Load article content
    loadArticleContent(articleId);
    
    // Show modal
    modal.style.display = 'block';
    
    // Set initial language view
    if (currentLang === 'en') {
        container.classList.add('show-english');
    } else {
        container.classList.remove('show-english');
    }
}

// Close article
function closeArticle() {
    const modal = document.getElementById('articleModal');
    modal.style.display = 'none';
}

// Load article content
function loadArticleContent(articleId) {
    const article = articles[articleId];
    
    if (!article) {
        console.error('Article not found:', articleId);
        return;
    }
    
    // Arabic content
    document.getElementById('articleTitleAr').textContent = article.ar.title;
    document.querySelector('.arabic-article .article-date').textContent = `التاريخ: ${article.ar.date}`;
    document.getElementById('articleBodyAr').innerHTML = article.ar.body;
    
    // English content
    document.getElementById('articleTitleEn').textContent = article.en.title;
    document.querySelector('.english-article .article-date').textContent = `Date: ${article.en.date}`;
    document.getElementById('articleBodyEn').innerHTML = article.en.body;
}

// Toggle article language
function toggleArticleLang() {
    const container = document.getElementById('articlesContainer');
    container.classList.toggle('show-english');
    
    // Update current language
    currentLang = container.classList.contains('show-english') ? 'en' : 'ar';
}

// Add click handlers to article cards
document.addEventListener('DOMContentLoaded', function() {
    const articleCards = document.querySelectorAll('.article-card');
    articleCards.forEach(card => {
        card.addEventListener('click', function() {
            const articleId = this.getAttribute('data-article');
            openArticle(articleId);
        });
    });
});

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('articleModal');
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeArticle();
        }
    });
});

// Close with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeArticle();
    }
});

// Check for deep link on load
window.addEventListener('load', () => {
    const params = new URLSearchParams(window.location.search);
    const article = params.get('article');
    if (article) {
        openArticle(article);
    }
});
