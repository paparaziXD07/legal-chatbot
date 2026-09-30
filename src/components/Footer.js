import React from 'react';

const s = {
  footer: {
    marginTop: 50, paddingTop: 20,
    borderTop: '1px solid #C9BBA0',
    fontSize: 11.5, color: '#8a7a60',
    display: 'flex', justifyContent: 'space-between',
    flexWrap: 'wrap', gap: 8,
    fontFamily: "'IBM Plex Mono', monospace",
  },
};

export default function Footer() {
  return (
    <footer style={s.footer}>
      <span>แชทบอทเพื่อให้ความรู้ด้านกฎหมาย พ.ร.บ.คอมพิวเตอร์ และ PDPA</span>
      <span>RAG · OpenThaiGPT · React · Node.js · PostgreSQL</span>
    </footer>
  );
}
