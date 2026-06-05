import { useState, useMemo } from 'react';
import { BookOpen, Code2, Key, Rocket, Shield } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { CopyButton } from '../components/ui/CopyButton';
import { useDebounce } from '../hooks/useDebounce';
import styles from '../styles/modules/pages/DocsPage.module.scss';

const SECTIONS = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        icon: Rocket,
        content: [
            { type: 'p', text: 'ObserveX monitors your API traffic in real time. Install the SDK or send hits directly to the ingest endpoint.' },
            { type: 'ol', items: [
                'Create an API key from the dashboard',
                'Add the middleware to your application',
                'View metrics in the Analytics dashboard',
            ]},
        ],
    },
    {
        id: 'authentication',
        title: 'Authentication',
        icon: Shield,
        content: [
            { type: 'p', text: 'Dashboard authentication uses JWT cookies. API ingestion uses API key headers.' },
            { type: 'code', language: 'http', code: 'x-api-key: apim_your_key_here' },
        ],
    },
    {
        id: 'api-keys',
        title: 'API Keys',
        icon: Key,
        content: [
            { type: 'p', text: 'API keys are scoped to a client organization. Each key has an environment: production, staging, development, or testing.' },
            { type: 'callout', text: 'Keys are shown only once at creation. Store them securely in your secrets manager.' },
        ],
    },
];

const CODE_EXAMPLES = [
    {
        id: 'nodejs-express',
        title: 'Node.js — Express',
        language: 'javascript',
        code: `const axios = require('axios');

app.use(async (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    axios.post('https://your-domain/api/hit', {
      serviceName: 'my-service',
      endpoint: req.path,
      method: req.method,
      statusCode: res.statusCode,
      latency: Date.now() - start,
    }, { headers: { 'x-api-key': process.env.OBSERVEX_API_KEY } });
  });
  next();
});`,
    },
    {
        id: 'nestjs',
        title: 'NestJS',
        language: 'typescript',
        code: `@Injectable()
export class MonitoringInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const start = Date.now();
    const req = context.switchToHttp().getRequest();
    return next.handle().pipe(tap(() => this.report(req, Date.now() - start)));
  }
}`,
    },
    {
        id: 'python-django',
        title: 'Python — Django',
        language: 'python',
        code: `import requests, time

class ObserveXMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.time()
        response = self.get_response(request)
        requests.post('https://your-domain/api/hit', json={
            'serviceName': 'django-app',
            'endpoint': request.path,
            'method': request.method,
            'statusCode': response.status_code,
            'latency': int((time.time() - start) * 1000),
        }, headers={'x-api-key': settings.OBSERVEX_API_KEY})
        return response`,
    },
    {
        id: 'java-spring',
        title: 'Java — Spring Boot',
        language: 'java',
        code: `@Component
public class ObserveXFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req,
            HttpServletResponse res, FilterChain chain) {
        long start = System.currentTimeMillis();
        chain.doFilter(req, res);
        reportHit(req, res, System.currentTimeMillis() - start);
    }
}`,
    },
    {
        id: 'php-laravel',
        title: 'PHP — Laravel',
        language: 'php',
        code: `class ObserveXMiddleware {
    public function handle($request, Closure $next) {
        $start = microtime(true);
        $response = $next($request);
        Http::post(config('observex.url'), [
            'serviceName' => 'laravel-app',
            'endpoint' => $request->path(),
            'method' => $request->method(),
            'statusCode' => $response->status(),
            'latency' => (int)((microtime(true) - $start) * 1000),
        ]);
        return $response;
    }
}`,
    },
];

function DocContent({ blocks }) {
    return (
        <div className={styles.prose}>
            {blocks.map((block, i) => {
                if (block.type === 'p') return <p key={i}>{block.text}</p>;
                if (block.type === 'ol') return (
                    <ol key={i}>{block.items.map((item) => <li key={item}>{item}</li>)}</ol>
                );
                if (block.type === 'callout') return (
                    <div key={i} className={styles.callout}>{block.text}</div>
                );
                if (block.type === 'code') return (
                    <div key={i} className={styles.inlineCodeWrap}>
                        <code className={styles.inlineCode}>{block.code}</code>
                        <CopyButton text={block.code} label="Copy" />
                    </div>
                );
                return null;
            })}
        </div>
    );
}

function CodeSnippet({ example }) {
    const lines = example.code.split('\n');
    return (
        <div className={styles.codePanel}>
            <div className={styles.codePanelHeader}>
                <span className={styles.langBadge}>{example.language}</span>
                <CopyButton text={example.code} label="Copy code" />
            </div>
            <div className={styles.codeScroll}>
                <table className={styles.codeTable}>
                    <tbody>
                        {lines.map((line, i) => (
                            <tr key={i}>
                                <td className={styles.lineNumber}>{i + 1}</td>
                                <td className={styles.lineCode}><code>{line || ' '}</code></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function DocumentationPage() {
    const [search, setSearch] = useState('');
    const [activeSection, setActiveSection] = useState('getting-started');
    const debouncedSearch = useDebounce(search);

    const allItems = useMemo(() => [
        ...SECTIONS.map((s) => ({ ...s, kind: 'section' })),
        ...CODE_EXAMPLES.map((e) => ({ ...e, kind: 'example' })),
    ], []);

    const visibleItems = useMemo(() => {
        const q = debouncedSearch.toLowerCase();
        if (!q) return allItems;
        return allItems.filter((item) => {
            const text = item.kind === 'section'
                ? `${item.title} ${JSON.stringify(item.content)}`
                : `${item.title} ${item.code}`;
            return text.toLowerCase().includes(q);
        });
    }, [allItems, debouncedSearch]);

    const activeItem = allItems.find((item) => item.id === activeSection);

    return (
        <div className={styles.docsLayout}>
            <aside className={styles.docsSidebar}>
                <div className={styles.sidebarHeader}>
                    <BookOpen size={18} aria-hidden="true" />
                    <span>Documentation</span>
                </div>
                <nav aria-label="Documentation table of contents">
                    <p className={styles.tocTitle}>Guides</p>
                    {SECTIONS.map((s) => {
                        const Icon = s.icon;
                        return (
                            <button
                                key={s.id}
                                type="button"
                                className={`${styles.tocLink} ${activeSection === s.id ? styles.active : ''}`}
                                onClick={() => setActiveSection(s.id)}
                            >
                                <Icon size={16} aria-hidden="true" />
                                {s.title}
                            </button>
                        );
                    })}
                    <p className={styles.tocTitle}>Integration Examples</p>
                    {CODE_EXAMPLES.map((ex) => (
                        <button
                            key={ex.id}
                            type="button"
                            className={`${styles.tocLink} ${activeSection === ex.id ? styles.active : ''}`}
                            onClick={() => setActiveSection(ex.id)}
                        >
                            <Code2 size={16} aria-hidden="true" />
                            {ex.title}
                        </button>
                    ))}
                </nav>
            </aside>

            <div className={styles.docsContent}>
                <PageHeader
                    title="Documentation"
                    description="Integration guides, authentication reference, and copy-paste code examples"
                    breadcrumbs={[{ label: 'Home', href: '/client/dashboard' }, { label: 'Docs' }]}
                />
                <SearchInput
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search documentation..."
                    className={styles.search}
                />

                {visibleItems.length === 0 && (
                    <div className={styles.noResults}>No documentation matches your search.</div>
                )}

                {activeItem && (
                    <article className={styles.article}>
                        <header className={styles.articleHeader}>
                            <h2>{activeItem.title}</h2>
                            {activeItem.kind === 'example' && (
                                <p className={styles.articleLead}>
                                    Copy this snippet into your project to start sending API metrics to ObserveX.
                                </p>
                            )}
                        </header>
                        {activeItem.kind === 'section' ? (
                            <DocContent blocks={activeItem.content} />
                        ) : (
                            <CodeSnippet example={activeItem} />
                        )}
                    </article>
                )}
            </div>
        </div>
    );
}
