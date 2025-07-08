#!/usr/bin/env python3
import sys
import re
from sympy import symbols, Eq, sympify, simplify_logic, solve
from sympy.core.relational import Relational


def forward(pre: str, stmt: str) -> str:
    # Preprocess Java logical operators to SymPy bitwise operators
    pre_trans = pre.replace('&&', ' & ').replace('||', ' | ').replace('!', '~')
    # Wrap each relational atom in parentheses for correct parsing
    def wrap_rel(m):
        return f"({m.group(0)})"
    pre_trans = re.sub(r'[a-zA-Z_]\w*\s*(?:==|!=|>=|<=|>|<)\s*[^&|()]+', wrap_rel, pre_trans)

    # Strip trailing semicolon from statement and parse
    stmt_clean = stmt.rstrip(';').strip()
    m = re.match(r"^([a-zA-Z]\w*)\s*=\s*(.+)$", stmt_clean)
    if not m:
        raise ValueError(f"Cannot parse statement: {stmt}")
    var, expr_str = m.group(1), m.group(2)

    # Define symbols for old and new variable
    old_var = symbols(var + '_old')
    new_var = symbols(var)

    # Parse precondition and expression using old_var for 'var'
    pre_cond = sympify(pre_trans, locals={var: old_var}, evaluate=False)
    expr = sympify(expr_str, locals={var: old_var}, evaluate=False)

    # Create equation new_var == expr
    eq = Eq(new_var, expr)

    # Try to solve for old_var
    sol = solve(eq, old_var)
    if sol:
        sol_old = sol[0]
        # Substitute solution into pre_cond, then simplify logic
        post_simpl = simplify_logic(pre_cond.subs({old_var: sol_old}), force=True)
        return str(post_simpl)

    # Fallback: return conjunction of substituted pre and equation
    substituted_pre = pre_cond.subs({old_var: expr})
    fallback = simplify_logic(substituted_pre & eq, force=True)
    return str(fallback)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("ERROR: expected 2 args: pre stmt;")
        sys.exit(1)
    try:
        print(forward(sys.argv[1], sys.argv[2]))
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)
