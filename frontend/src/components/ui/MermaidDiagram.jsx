import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'Inter, sans-serif',
    flowchart: { useMaxWidth: false, htmlLabels: true },
    er: { useMaxWidth: false }
});

export default function MermaidDiagram({ code }) {
    const elementRef = useRef(null);
    const [svg, setSvg] = useState('');

    useEffect(() => {
        const renderDiagram = async () => {
            if (code && elementRef.current) {
                try {
                    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                    const { svg } = await mermaid.render(id, code);
                    setSvg(svg);
                } catch (error) {
                    console.error('Mermaid render error:', error);
                    setSvg(`<div class="text-red-500 bg-red-50 p-4 rounded">Error rendering diagram</div>`);
                }
            }
        };

        renderDiagram();
    }, [code]);

    return (
        <div className="mermaid-component bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-[600px] relative group" ref={elementRef}>
            {svg && (
                <TransformWrapper
                    initialScale={0.8}
                    initialPositionX={0}
                    initialPositionY={0}
                    centerOnInit={true}
                    minScale={0.5}
                    maxScale={4}
                    limitToBounds={false}
                >
                    {({ zoomIn, zoomOut, resetTransform }) => (
                        <>
                            <div className="absolute top-4 right-4 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-slate-800/90 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg backdrop-blur-sm">
                                <button onClick={() => zoomIn()} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-300 transition-colors" title="Zoom In">
                                    <ZoomIn className="h-4 w-4" />
                                </button>
                                <button onClick={() => zoomOut()} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-300 transition-colors" title="Zoom Out">
                                    <ZoomOut className="h-4 w-4" />
                                </button>
                                <button onClick={() => resetTransform()} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-300 transition-colors" title="Reset View">
                                    <RotateCcw className="h-4 w-4" />
                                </button>
                            </div>

                            <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                                <div
                                    className="w-full h-full flex items-center justify-center pointer-events-auto"
                                    dangerouslySetInnerHTML={{ __html: svg }}
                                />
                            </TransformComponent>
                        </>
                    )}
                </TransformWrapper>
            )}
            {!svg && <div className="flex items-center justify-center h-full text-slate-400">Loading diagram...</div>}
        </div>
    );
}
