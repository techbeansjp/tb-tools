declare module 'js-beautify/js/lib/beautify-html' {
  export function html_beautify(
    html_source: string,
    options?: {
      indent_size?: number;
      indent_char?: string;
      max_preserve_newlines?: number;
      preserve_newlines?: boolean;
      indent_inner_html?: boolean;
      brace_style?: string;
      wrap_line_length?: number;
      end_with_newline?: boolean;
      indent_scripts?: 'keep' | 'separate' | 'normal';
      wrap_attributes?: 'auto' | 'force' | 'force-aligned' | 'force-expand-multiline';
      wrap_attributes_indent_size?: number;
      unformatted?: string[];
      content_unformatted?: string[];
      extra_liners?: string[];
      eol?: string;
    }
  ): string;
  
  const html: {
    html_beautify: typeof html_beautify;
  };
  
  export default html;
}
