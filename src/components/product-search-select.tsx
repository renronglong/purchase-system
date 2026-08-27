"use client";

import { useState, useRef, useEffect } from "react";
import { productStore, type Product } from "@/lib/store";

interface ProductSearchSelectProps {
  value: string;
  onChange: (product: Product | null) => void;
  placeholder?: string;
}

export default function ProductSearchSelect({ value, onChange, placeholder = "输入编号/名称搜索" }: ProductSearchSelectProps) {
  const [keyword, setKeyword] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setKeyword(value);
  }, [value]);

  useEffect(() => {
    if (keyword.length >= 1) {
      const found = productStore.search(keyword);
      setResults(found.slice(0, 20));
      setIsOpen(found.length > 0);
    } else {
      setResults([]);
      setIsOpen(false);
    }
    setSelectedIndex(-1);
  }, [keyword]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (product: Product) => {
    setKeyword(product.id);
    setIsOpen(false);
    onChange(product);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onFocus={() => { if (results.length > 0) setIsOpen(true); }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500"
      />
      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-auto">
          {results.map((product, idx) => (
            <div
              key={product.id}
              onClick={() => handleSelect(product)}
              className={`px-2 py-1.5 cursor-pointer text-xs hover:bg-blue-50 ${idx === selectedIndex ? "bg-blue-50" : ""}`}
            >
              <span className="font-mono text-blue-600">{product.id}</span>
              <span className="ml-2 text-slate-700">{product.name}</span>
              <span className="ml-2 text-slate-400">{product.spec}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
