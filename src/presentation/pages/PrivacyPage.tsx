import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Home, ChevronRight, ChevronDown, Lock, Shield, FileText, ArrowUpRight } from 'lucide-react';
import { policyData } from '../data/policyData';

export const PrivacyPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const docParam = searchParams.get('doc');
    const selectedDocId = (docParam && policyData[docParam]) ? docParam : 'privacy';

    const setSelectedDocId = (id: string) => {
        setSearchParams({ doc: id });
    };

    const [activeSection, setActiveSection] = useState('preamble');
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const activeDoc = policyData[selectedDocId] || policyData.privacy;

    // Helper to parse raw markdown text into structured sections with custom titles and ids
    const parseDocumentSections = (rawText: string) => {
        const lines = rawText.split('\n');
        const sectionsList: { id: string; title: string; lines: string[] }[] = [];

        let currentSection = {
            id: 'preamble',
            title: 'Overview',
            lines: [] as string[]
        };

        lines.forEach(line => {
            const cleanLine = line.trim();
            if (cleanLine.startsWith('## ')) {
                // Save the preceding section if it contains lines
                if (currentSection.lines.length > 0 || currentSection.id !== 'preamble') {
                    sectionsList.push(currentSection);
                }

                // Form a clean, readable section title and unique element ID
                const rawTitle = cleanLine.replace(/^##\s+__?|__?\s*$/g, '').replace(/\\/g, '').trim();
                const cleanTitle = rawTitle
                    .replace(/^\d+\.\s+/, '')
                    .replace(/^CLAUSE\s+\d+\s+—\s+/, '')
                    .replace(/^CLAUSE\s+\d+\s+—\s+/, ''); // Double clause clean up if present

                const slug = rawTitle
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');

                currentSection = {
                    id: slug || `section-${sectionsList.length}`,
                    title: cleanTitle || rawTitle,
                    lines: []
                };
            } else {
                currentSection.lines.push(line);
            }
        });

        if (currentSection.lines.length > 0) {
            sectionsList.push(currentSection);
        }

        return sectionsList;
    };

    const docSections = parseDocumentSections(activeDoc.content);

    // Format inline markdown tags: bold, italic, and clean backslashes
    const formatInlineMarkdown = (text: string) => {
        return text
            .replace(/__([^_]+)__/g, '<strong>$1</strong>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/_([^_]+)_/g, '<em>$1</em>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            .replace(/\\/g, ''); // Clean Mammoth backslashes
    };

    // Group raw lines into beautiful styled semantic block items
    const parseBlocks = (lines: string[]) => {
        const blocks: { 
            type: 'p' | 'h3' | 'ul' | 'alert' | 'note' | 'table'; 
            text: string; 
            items?: string[]; 
            tableData?: { headers: string[]; rows: string[][] } 
        }[] = [];
        
        let currentBlock: string[] = [];
        let currentType: 'p' | 'h3' | 'ul' | 'alert' | 'note' = 'p';

        const flushBlock = () => {
            if (currentBlock.length === 0) return;
            const text = currentBlock.join('\n').trim();
            if (text) {
                if (currentType === 'ul') {
                    blocks.push({
                        type: 'ul',
                        text: '',
                        items: currentBlock.map(line => line.replace(/^-\s+/, '').trim())
                    });
                } else {
                    blocks.push({ type: currentType, text });
                }
            }
            currentBlock = [];
            currentType = 'p';
        };

        let i = 0;
        while (i < lines.length) {
            const line = lines[i];
            const trimmed = line.trim();

            if (trimmed === '') {
                flushBlock();
                i++;
                continue;
            }

            // --- TABLE DETECTION ---
            // A table starts if we have 2 or 4 consecutive non-empty lines that are bolded, e.g. __Col__
            // Let's look ahead to see if they match table headers
            let boldCount = 0;
            let lookAheadIdx = i;
            const possibleHeaders: string[] = [];

            while (lookAheadIdx < lines.length) {
                const aheadTrimmed = lines[lookAheadIdx].trim();
                if (aheadTrimmed === '') {
                    lookAheadIdx++;
                    continue;
                }
                const isBold = (aheadTrimmed.startsWith('__') && aheadTrimmed.endsWith('__')) || 
                               (aheadTrimmed.startsWith('**') && aheadTrimmed.endsWith('**'));
                if (isBold && !aheadTrimmed.includes('\n')) {
                    possibleHeaders.push(aheadTrimmed.replace(/^(__|\*\*)|(__|\*\*)$/g, '').replace(/\\/g, '').trim());
                    boldCount++;
                    lookAheadIdx++;
                } else {
                    break;
                }
            }

            if (boldCount === 2 || boldCount === 4) {
                const isRealTable = possibleHeaders.some(h => {
                    const low = h.toLowerCase();
                    return low.includes('scenario') || 
                           low.includes('refund?') || 
                           low.includes('refund treatment') || 
                           low.includes('preparation stage') || 
                           low.includes('time before') || 
                           low.includes('payment method') || 
                           low.includes('expected refund') || 
                           low.includes('refund credit');
                });

                if (isRealTable) {
                    flushBlock(); // Flush any pending paragraph blocks first

                    const tableCells: string[] = [];
                    let cellsIdx = lookAheadIdx;
                    let stopTable = false;

                    while (cellsIdx < lines.length && !stopTable) {
                        const rLine = lines[cellsIdx];
                        const rTrimmed = rLine.trim();
                        if (rTrimmed === '') {
                            cellsIdx++;
                            continue;
                        }

                        // Stop table if we hit new section headings, lists, alert boxes, or note titles
                        if (rTrimmed.startsWith('### ') || rTrimmed.startsWith('## ') || rTrimmed.startsWith('- ') || rTrimmed.startsWith('⚑') || rTrimmed.includes('Legal Risk:')) {
                            stopTable = true;
                            break;
                        }

                        // Stop if we hit a signature line or a full page agreement text that starts with bold
                        if (rTrimmed.startsWith('__') && rTrimmed.endsWith('__') && rTrimmed.length > 35 && tableCells.length % boldCount === 0) {
                            stopTable = true;
                            break;
                        }

                        tableCells.push(rTrimmed);
                        cellsIdx++;
                    }

                    const rows: string[][] = [];
                    for (let k = 0; k < tableCells.length; k += boldCount) {
                        const row = tableCells.slice(k, k + boldCount);
                        if (row.length === boldCount) {
                            rows.push(row);
                        } else if (row.length > 0) {
                            // Pad row if it has incomplete columns
                            while (row.length < boldCount) row.push('');
                            rows.push(row);
                        }
                    }

                    if (rows.length > 0) {
                        blocks.push({
                            type: 'table',
                            text: '',
                            tableData: {
                                headers: possibleHeaders,
                                rows
                            }
                        });
                        i = cellsIdx;
                        continue;
                    }
                }
            }
            // --- END TABLE DETECTION ---

            if (trimmed.startsWith('### ')) {
                flushBlock();
                currentType = 'h3';
                currentBlock.push(trimmed);
                flushBlock();
            } else if (trimmed.startsWith('- ')) {
                if (currentType !== 'ul') {
                    flushBlock();
                    currentType = 'ul';
                }
                currentBlock.push(trimmed);
            } else if (trimmed.startsWith('⚑') || trimmed.includes('Legal Risk:')) {
                flushBlock();
                currentType = 'alert';
                currentBlock.push(trimmed);
                flushBlock();
            } else if (trimmed.startsWith('__') && trimmed.endsWith('__') && trimmed.length > 20 && !trimmed.includes('\n')) {
                flushBlock();
                currentType = 'note';
                currentBlock.push(trimmed);
                flushBlock();
            } else {
                if (currentType !== 'p') {
                    flushBlock();
                }
                currentBlock.push(line);
            }
            i++;
        }

        flushBlock();
        return blocks;
    };

    // Reset section outline and scroll to top on document query change
    useEffect(() => {
        setActiveSection('preamble');
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [selectedDocId]);

    // Setup active scroll-spy intersection observers for headings
    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '-15% 0px -55% 0px',
            threshold: 0.05
        };

        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        docSections.forEach(sec => {
            const el = document.getElementById(sec.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [selectedDocId, activeDoc]);

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            const offset = 96; // compensate for top header height + margin
            const elementPosition = el.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            setActiveSection(id);
            setMobileNavOpen(false);
        }
    };

    // Sidebar policy items mapping to raw policy data keys
    const policySidebarItems = [
        { id: 'privacy', label: 'Privacy Policy', icon: Shield, category: 'Core Policies' },
        { id: 'terms', label: 'Terms & Conditions', icon: Lock, category: 'Core Policies' },
        { id: 'refund', label: 'Refund & Cancellation', icon: FileText, category: 'Core Policies' }
    ];



    return (
        <div className="min-h-screen bg-white font-sans text-gray-800">
            {/* Custom self-contained style for hiding swipable document scrollbars */}
            <style>{`
                .scrollbar-none::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-none {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

            {/* Mobile Table of Contents Bar */}
            <div className="lg:hidden bg-gray-50 border-b border-gray-200 px-6 py-3 sticky top-[64px] md:top-[72px] z-30 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Document Sections</span>
                <button
                    onClick={() => setMobileNavOpen(!mobileNavOpen)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-[#B02421] hover:text-[#FF4732] focus:outline-none"
                >
                    <span>Jump to Section</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileNavOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileNavOpen && (
                <div className="lg:hidden fixed inset-0 z-20 bg-black/40 backdrop-blur-xs top-[112px] md:top-[120px]" onClick={() => setMobileNavOpen(false)}>
                    <div className="bg-white max-h-[60vh] overflow-y-auto px-6 py-4 shadow-xl flex flex-col gap-2.5 animate-in slide-in-from-top-4 duration-200" onClick={e => e.stopPropagation()}>
                        {docSections.map((sec) => (
                            <button
                                key={sec.id}
                                onClick={() => scrollToSection(sec.id)}
                                className={`w-full text-left text-sm py-2 px-3 rounded-lg font-semibold transition-all ${activeSection === sec.id
                                        ? 'bg-[#FFF4F3] text-[#B02421]'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {sec.title}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Core 3-Column Layout Container */}
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex flex-col md:flex-row gap-10">

                    {/* Left Sidebar - Policy Guidelines Index */}
                    <aside className="hidden md:block w-64 flex-shrink-0 border-r border-gray-100 pr-6 self-start sticky top-24">
                        <nav className="flex flex-col gap-1.5">
                            {policySidebarItems.map((item) => {
                                const isActive = item.id === selectedDocId;
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setSelectedDocId(item.id)}
                                        className={`w-full text-left px-4 py-2.5 text-[13.5px] font-bold rounded-xl transition-all flex items-center gap-2.5 cursor-pointer ${isActive
                                                ? 'bg-[#FFF4F3] text-[#B02421]'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#B02421]' : 'text-gray-400'}`} />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* Center Column - Rich Policy Content */}
                    <main className="flex-1 min-w-0 pr-0 lg:pr-6">
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6">
                            <Link to="/" className="hover:text-gray-600 flex items-center gap-1">
                                <Home className="w-3.5 h-3.5" />
                                <span>Home</span>
                            </Link>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-gray-400">Legal Portal</span>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-gray-500">{activeDoc.title}</span>
                        </div>

                        {/* Mobile Swipeable Document Selection Tabs */}
                        <div className="md:hidden flex gap-2.5 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-gray-100 -mx-6 px-6">
                            {policySidebarItems.map((item) => {
                                const isActive = item.id === selectedDocId;
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setSelectedDocId(item.id)}
                                        className={`whitespace-nowrap flex items-center gap-1.5 px-4.5 py-2 text-xs font-bold rounded-xl transition-all ${isActive
                                                ? 'bg-[#FFF4F3] text-[#B02421] shadow-xs'
                                                : 'text-gray-500 bg-gray-50 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#B02421]' : 'text-gray-400'}`} />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Title & Badge */}
                        <h1 className="text-3.5xl md:text-4.5xl font-extrabold text-gray-900 tracking-tight mb-2 font-inter leading-tight">
                            {activeDoc.title}
                        </h1>
                        <div className="flex items-center gap-3 mb-10 flex-wrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFF4F3] text-[#B02421]">
                                WaradaVinayaka Private Limited
                            </span>
                            <span className="text-xs text-gray-400 font-bold">
                                Version 1.0 • Effective: [DATE]
                            </span>
                        </div>

                        {/* Semantic Sections Container */}
                        <div className="space-y-14 text-[14.5px] leading-relaxed text-gray-600">
                            {docSections.map((sec) => (
                                <section key={sec.id} id={sec.id} className="scroll-mt-36 border-t border-gray-50 pt-8 first:border-0 first:pt-0">
                                    {sec.id !== 'preamble' && (
                                        <h2 className="text-xl font-bold text-gray-900 mb-5 font-inter tracking-tight flex items-center gap-2">
                                            <span className="w-2 h-4 bg-[#B02421] rounded-xs"></span>
                                            <span>{sec.title}</span>
                                        </h2>
                                    )}
                                    <div className="space-y-4">
                                        {parseBlocks(sec.lines).map((block, idx) => {
                                            if (block.type === 'h3') {
                                                return (
                                                    <h3
                                                        key={idx}
                                                        className="text-[15.5px] font-bold text-gray-900 mt-6 mb-3 font-inter flex items-center gap-1.5 border-b border-gray-50 pb-1.5"
                                                        dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(block.text.replace(/^###\s+__?|__?\s*$/g, '').trim()) }}
                                                    />
                                                );
                                            }
                                            if (block.type === 'ul') {
                                                return (
                                                    <ul key={idx} className="list-none pl-1 space-y-2.5 my-4">
                                                        {block.items?.map((item, itemIdx) => (
                                                            <li key={itemIdx} className="flex items-start gap-2.5 text-sm text-gray-600">
                                                                 <span className="text-[#B02421] text-xs mt-1.5 flex-shrink-0">•</span>
                                                                 <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }} />
                                                            </li>
                                                        ))}
                                                    </ul>
                                                );
                                            }
                                            if (block.type === 'alert') {
                                                return (
                                                    <div key={idx} className="bg-[#FFF4F3] border-l-4 border-[#B02421] p-4.5 my-6 rounded-r-xl shadow-xs">
                                                        <div className="flex items-start gap-3">
                                                            <span className="text-[#B02421] text-base mt-0.5">⚑</span>
                                                            <div>
                                                                <h4 className="font-extrabold text-[#B02421] text-xs uppercase tracking-wider mb-1 font-inter">Legal Risk Shield Note</h4>
                                                                <p className="text-xs text-gray-800 leading-relaxed font-semibold" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(block.text.replace(/^⚑\s*/, '')) }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            if (block.type === 'note') {
                                                return (
                                                    <div key={idx} className="bg-amber-50 border-l-4 border-amber-500 p-4.5 my-6 rounded-r-xl shadow-xs">
                                                        <div className="flex items-start gap-3">
                                                            <span className="text-amber-600 text-base mt-0.5">⚠️</span>
                                                            <div>
                                                                <h4 className="font-extrabold text-amber-800 text-xs uppercase tracking-wider mb-1 font-inter">Important Clause Warning</h4>
                                                                <p className="text-xs text-gray-800 leading-relaxed font-semibold" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(block.text.replace(/^__?|__?$/g, '')) }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            if (block.type === 'table' && block.tableData) {
                                                const { headers, rows } = block.tableData;
                                                return (
                                                    <div key={idx} className="overflow-x-auto border border-gray-150 rounded-2xl my-6 shadow-xs">
                                                        <table className="min-w-full divide-y divide-gray-150 text-left text-[13.5px]">
                                                            <thead className="bg-gray-50 text-[11px] font-extrabold uppercase tracking-widest text-gray-500 font-inter">
                                                                <tr>
                                                                    {headers.map((header, hIdx) => (
                                                                        <th key={hIdx} className="px-5 py-4 font-bold">
                                                                            {header}
                                                                        </th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-100 bg-white">
                                                                {rows.map((row, rowIdx) => (
                                                                    <tr key={rowIdx} className="hover:bg-gray-50/50 transition-all duration-150">
                                                                        {row.map((cell, cellIdx) => {
                                                                            const cleanCell = cell.replace(/\\/g, '').trim();
                                                                            
                                                                            // Highlight YES / NO / PARTIAL dynamically in table cells
                                                                            let badgeStyle = "";
                                                                            const isStatusColumn = headers[cellIdx].toLowerCase().includes('refund?');
                                                                            
                                                                            if (isStatusColumn) {
                                                                                if (cleanCell.toUpperCase().includes('YES')) {
                                                                                    badgeStyle = "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-green-50 text-green-700 border border-green-150 uppercase tracking-wide";
                                                                                } else if (cleanCell.toUpperCase().includes('NO') && !cleanCell.toUpperCase().includes('PARTIAL')) {
                                                                                    badgeStyle = "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-50 text-red-700 border border-red-150 uppercase tracking-wide";
                                                                                } else {
                                                                                    badgeStyle = "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-150 uppercase tracking-wide";
                                                                                }
                                                                            }

                                                                            return (
                                                                                <td key={cellIdx} className="px-5 py-4 align-top leading-relaxed text-gray-600 font-medium">
                                                                                    {badgeStyle ? (
                                                                                        <span className={badgeStyle}>{cleanCell}</span>
                                                                                    ) : (
                                                                                        <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(cell) }} />
                                                                                    )}
                                                                                </td>
                                                                            );
                                                                        })}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                );
                                            }
                                            return (
                                                <p
                                                    key={idx}
                                                    className="text-[14.5px] leading-relaxed text-gray-600 my-3.5"
                                                    dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(block.text) }}
                                                />
                                            );
                                        })}
                                    </div>
                                </section>
                            ))}

                            {/* Sticky footer email callout box */}
                            <section id="contact-panel" className="scroll-mt-36 pb-20 border-t border-gray-100 pt-10">
                                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <p className="font-bold text-gray-950 text-base mb-1">Need help with these legal terms?</p>
                                        <p className="text-sm text-gray-500">Our administrative compliance desk is available to assist you.</p>
                                    </div>
                                    <a
                                        href="mailto:info@hivago.in"
                                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#B02421] text-white rounded-xl font-bold text-sm hover:scale-105 active:scale-95 shadow-md shadow-[#B02421]/15 transition-all cursor-pointer"
                                    >
                                        <span>Contact Compliance Desk</span>
                                        <ArrowUpRight className="w-4 h-4" />
                                    </a>
                                </div>
                            </section>
                        </div>
                    </main>

                    {/* Right Sidebar - Sticky Table of Contents Scrollspy */}
                    <aside className="w-72 flex-shrink-0 hidden lg:block border-l border-gray-100 pl-6 sticky top-24 self-start max-h-[calc(100vh-120px)] overflow-y-auto no-scrollbar">
                        <h4 className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-4">
                            Document Outline
                        </h4>
                        <ul className="flex flex-col gap-0.5 border-l border-gray-100 -ml-[1px]">
                            {docSections.map((sec) => {
                                const isCurrent = activeSection === sec.id;
                                return (
                                    <li key={sec.id}>
                                        <button
                                            onClick={() => scrollToSection(sec.id)}
                                            className={`w-full text-left text-xs font-semibold py-1.5 transition-all text-ellipsis overflow-hidden whitespace-nowrap pl-3.5 border-l-2 -ml-[1px] leading-snug cursor-pointer ${isCurrent
                                                    ? 'border-[#B02421] text-[#B02421] font-bold'
                                                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200'
                                                }`}
                                            title={sec.title}
                                        >
                                            {sec.title}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </aside>
                </div>
            </div>
        </div>
    );
};
