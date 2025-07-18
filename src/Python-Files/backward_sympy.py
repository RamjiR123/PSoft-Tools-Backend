#!/usr/bin/env python3
import sys
import re
from sympy import symbols, Eq, sympify, simplify_logic
from sympy.core.relational import Relational


def backward(stmt: str, post: str) -> str:
    #changes Java operators to SymPy bitwise operators
    post_trans = post.replace('&&', ' & ').replace('||', ' | ').replace('!', '~')
    #wrap each relational atom in parentheses for correct parsing
    def wrap_rel(m):
        return f"({m.group(0)})"
    post_trans = re.sub(r'[a-zA-Z_]\w*\s*(?:==|!=|>=|<=|>|<)\s*[^&|()]+', wrap_rel, post_trans)

    #gets rid of semicolon
    stmt_clean = stmt.rstrip(';').strip()
    m = re.match(r"^([a-zA-Z]\w*)\s*=\s*(.+)$", stmt_clean)
    if not m:
        raise ValueError(f"Cannot parse statement: {stmt}")
    var, expr_str = m.group(1), m.group(2)

    #create lhs and rhs variables
    old_var = symbols(var + '_old')
    new_var = symbols(var)

    #subtitutes var with old var
    expr = sympify(expr_str, locals={var: old_var}, evaluate=False)

    #creates expression equal to new_var
    post_cond = sympify(post_trans, locals={var: new_var}, evaluate=False)

    #subsititues expression for new var
    pre_expr = post_cond.subs({new_var: expr})

    #renames old var to var
    pre_expr = pre_expr.xreplace({old_var: new_var})
    pre = simplify_logic(pre_expr, force=True)
    return str(pre)

#errors
if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("ERROR: expected 2 args: statement post;")
        sys.exit(1)
    stmt_arg, post_arg = sys.argv[1], sys.argv[2]
    try:
        print(backward(stmt_arg, post_arg))
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)
