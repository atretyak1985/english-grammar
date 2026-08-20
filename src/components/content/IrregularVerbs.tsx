import { IRREGULAR_VERB_GROUPS, STATE_VERBS, verbsInGroup, type VerbGroup } from '@/data/irregular-verbs';
import { H4, Table, Td, Th, Tr } from '@/components/content/blocks';

/**
 * Таблиця неправильних дієслів однієї групи. Малюється з того самого списку,
 * яким користується аналізатор тексту — тому теорія й підсвітка не розходяться.
 */
export function IrregularVerbs({ group }: { group: VerbGroup }) {
  const verbs = verbsInGroup(group);
  const perRow = 4;
  const rows: (typeof verbs)[] = [];
  for (let i = 0; i < verbs.length; i += perRow) {
    rows.push(verbs.slice(i, i + perRow));
  }

  return (
    <>
      <H4>{IRREGULAR_VERB_GROUPS[group].title}</H4>
      <Table>
        <tbody>
          {rows.map((row, index) => (
            <Tr key={index}>
              {row.map((verb) => (
                <Td key={verb.v1}>
                  {verb.v1} — {verb.v2} — {verb.v3}
                  {verb.note ? <span className="text-ink-3 block text-[13px]">{verb.note}</span> : null}
                </Td>
              ))}
              {row.length < perRow
                ? Array.from({ length: perRow - row.length }, (_, i) => <Td key={`pad-${i}`} />)
                : null}
            </Tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}

/** Дієслова стану за категоріями — ті, що не вживаються з -ing. */
export function StateVerbs() {
  return (
    <Table>
      <thead>
        <Tr>
          <Th>Категорія</Th>
          <Th>Дієслова</Th>
        </Tr>
      </thead>
      <tbody>
        {Object.entries(STATE_VERBS).map(([category, verbs]) => (
          <Tr key={category}>
            <Td>{category}</Td>
            <Td>{verbs.join(', ')}</Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}
